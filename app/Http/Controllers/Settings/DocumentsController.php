<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserDocument;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Documents', [
            'documents' => $this->formatDocuments($request),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'document' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,png,jpg,jpeg',
                'max:25600', // 25 MB
            ],
        ]);

        $file = $request->file('document');
        // Use 'local' disk — always available in Laravel by default
        $path = $this->storeWithOriginalName($file, "documents/{$request->user()->id}", 'local', 'document');

        $request->user()->documents()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => strtolower($file->getClientOriginalExtension()),
            'file_size' => $file->getSize(),
            'document_type' => $this->inferDocumentType($file->getClientOriginalName()),
        ]);

        return redirect()
            ->route('settings.documents')
            ->with('status', 'document-uploaded');
    }

    public function download(Request $request, UserDocument $document)
    {
        abort_unless($document->user_id === $request->user()->id, 403);

        $resolved = $this->resolveStoredDocument($document);
        abort_unless($resolved !== null, 404);

        ['disk' => $disk, 'path' => $path] = $resolved;
        $absolutePath = Storage::disk($disk)->path($path);
        abort_unless(file_exists($absolutePath), 404);

        // 'inline' opens in browser (PDF viewer, etc.) instead of forcing download
        return response()->file($absolutePath, [
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
        ]);
    }

    public function destroy(Request $request, UserDocument $document)
    {
        abort_unless($document->user_id === $request->user()->id, 403);

        $resolved = $this->resolveStoredDocument($document);
        if ($resolved !== null) {
            Storage::disk($resolved['disk'])->delete($resolved['path']);
        }
        $document->delete();

        return redirect()
            ->route('settings.documents')
            ->with('status', 'document-deleted');
    }

    /* ── Helpers ─────────────────────────────────────────────────────────── */

    private function formatDocuments(Request $request): \Illuminate\Support\Collection
    {
        return $request->user()
            ->documents()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(UserDocument $doc) => [
                'id' => $doc->id,
                'file_name' => $doc->file_name,
                'file_type' => strtoupper($doc->file_type),
                'file_size_kb' => (int) round($doc->file_size / 1024),
                'document_type' => $doc->document_type,
                'uploaded_at' => $doc->created_at->toISOString(),
            ]);
    }

    private function inferDocumentType(string $filename): string
    {
        $lower = strtolower($filename);

        if (str_contains($lower, 'cert'))
            return 'Technical Certificate';
        if (str_contains($lower, 'diploma'))
            return 'Diploma';
        if (str_contains($lower, 'degree'))
            return 'Degree';
        if (str_contains($lower, 'resume') || str_contains($lower, 'cv'))
            return 'CV / Resume';

        return 'Supporting Document';
    }

    private function storeWithOriginalName(UploadedFile $file, string $directory, string $disk, string $fallbackBase): string
    {
        $originalBase = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeBase = preg_replace('/[^A-Za-z0-9_\- ]+/', '', $originalBase) ?: $fallbackBase;
        $safeBase = trim(preg_replace('/\s+/', '_', $safeBase), '_') ?: $fallbackBase;

        $extension = strtolower($file->getClientOriginalExtension());
        $candidate = $extension !== '' ? "{$safeBase}.{$extension}" : $safeBase;
        $counter = 1;

        while (Storage::disk($disk)->exists("{$directory}/{$candidate}")) {
            $candidate = $extension !== ''
                ? "{$safeBase}_{$counter}.{$extension}"
                : "{$safeBase}_{$counter}";
            $counter++;
        }

        return $file->storeAs($directory, $candidate, $disk);
    }

    private function resolveStoredDocument(UserDocument $document): ?array
    {
        $rawPath = trim((string) $document->file_path);
        if ($rawPath === '') {
            $rawPath = '';
        }

        // Legacy records may store public URL style paths like /storage/resumes/1/file.pdf
        if (str_starts_with($rawPath, '/storage/')) {
            $publicPath = ltrim(substr($rawPath, strlen('/storage/')), '/');
            if (Storage::disk('public')->exists($publicPath)) {
                return ['disk' => 'public', 'path' => $publicPath];
            }
        }

        // Also support storage/resumes/... format
        if (str_starts_with($rawPath, 'storage/')) {
            $publicPath = ltrim(substr($rawPath, strlen('storage/')), '/');
            if (Storage::disk('public')->exists($publicPath)) {
                return ['disk' => 'public', 'path' => $publicPath];
            }
        }

        // Newer records store local disk relative paths like documents/{user_id}/file.pdf
        if (Storage::disk('local')->exists($rawPath)) {
            return ['disk' => 'local', 'path' => $rawPath];
        }

        // Fallback: some imports may have been stored on public without URL prefix
        if (Storage::disk('public')->exists($rawPath)) {
            return ['disk' => 'public', 'path' => $rawPath];
        }

        // Legacy fallback: try expected resume/document locations by original file name.
        $fileName = trim((string) $document->file_name);
        if ($fileName !== '') {
            $candidates = [
                "resumes/{$document->user_id}/{$fileName}",
                "documents/{$document->user_id}/{$fileName}",
                $fileName,
            ];

            foreach ($candidates as $candidate) {
                if (Storage::disk('public')->exists($candidate)) {
                    return ['disk' => 'public', 'path' => $candidate];
                }

                if (Storage::disk('local')->exists($candidate)) {
                    return ['disk' => 'local', 'path' => $candidate];
                }
            }

            $targetExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $normalizedTarget = preg_replace('/[^a-z0-9]+/i', '', strtolower(pathinfo($fileName, PATHINFO_FILENAME)));

            foreach (['public', 'local'] as $disk) {
                foreach (["resumes/{$document->user_id}", "documents/{$document->user_id}"] as $dir) {
                    $files = Storage::disk($disk)->files($dir);
                    if (empty($files)) {
                        continue;
                    }

                    // Prefer exact normalized name match when legacy naming changed punctuation/spaces.
                    foreach ($files as $filePath) {
                        $candidateExt = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                        if ($targetExt !== '' && $candidateExt !== $targetExt) {
                            continue;
                        }

                        $candidateBase = pathinfo($filePath, PATHINFO_FILENAME);
                        $normalizedCandidate = preg_replace('/[^a-z0-9]+/i', '', strtolower($candidateBase));
                        if ($normalizedTarget !== '' && $normalizedCandidate === $normalizedTarget) {
                            return ['disk' => $disk, 'path' => $filePath];
                        }
                    }

                    // Final fallback: use the most recently modified file with same extension.
                    $sameExtFiles = array_values(array_filter($files, function ($filePath) use ($targetExt) {
                        if ($targetExt === '') {
                            return true;
                        }

                        return strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === $targetExt;
                    }));

                    if (!empty($sameExtFiles)) {
                        usort($sameExtFiles, function ($a, $b) use ($disk) {
                            return Storage::disk($disk)->lastModified($b) <=> Storage::disk($disk)->lastModified($a);
                        });

                        return ['disk' => $disk, 'path' => $sameExtFiles[0]];
                    }
                }
            }
        }

        return null;
    }
}