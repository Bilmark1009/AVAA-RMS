<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <link rel="icon" type="image/png" href="{{ asset('logos/AVAA_Logo.png') }}">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    {{-- Prevent bfcache from flashing stale pages (runs before React) --}}
    <script>
        (function () {
            var p = window.location.pathname;
            var guest = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth/google'];
            var isGuest = guest.some(function (g) { return p === g || p.indexOf(g + '/') === 0; });
            if (isGuest && sessionStorage.getItem('auth_logged_in') === '1') {
                document.body.style.display = 'none';
                var dash = sessionStorage.getItem('auth_dashboard') || '/';
                window.location.replace(dash);
            }
            window.addEventListener('pageshow', function (e) {
                if (e.persisted) {
                    var np = window.location.pathname;
                    var isG = guest.some(function (g) { return np === g || np.indexOf(g + '/') === 0; });
                    if (isG && sessionStorage.getItem('auth_logged_in') === '1') {
                        document.body.style.display = 'none';
                        window.location.replace(sessionStorage.getItem('auth_dashboard') || '/');
                    }
                    if (!isG && sessionStorage.getItem('auth_logged_in') !== '1') {
                        document.body.style.display = 'none';
                        window.location.replace('/login');
                    }
                }
            });
        })();
    </script>
    @inertia
</body>

</html>