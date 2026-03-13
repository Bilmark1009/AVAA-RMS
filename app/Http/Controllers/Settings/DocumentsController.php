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

        return back()->with([
            'documents' => $this->formatDocuments($request),
        ]);
    }

    public function download(Request $request, UserDocument $document)
    {
        abort_unless($document->user_id === $request->user()->id, 403);

        $path = Storage::disk('local')->path($document->file_path);
        abort_unless(file_exists($path), 404);

        // 'inline' opens in browser (PDF viewer, etc.) instead of forcing download
        return response()->file($path, [
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
        ]);
    }

    public function destroy(Request $request, UserDocument $document)
    {
        abort_unless($document->user_id === $request->user()->id, 403);

        // Use 'local' disk to match where files were stored
        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return back();
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
                'uploaded_at' => $doc->created_at->format('j M Y'),
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
}