/* Runs in <head> before the page is drawn.
   Applies the saved theme so the page never flashes the wrong colours. */
(function () {
    var root = document.documentElement;
    root.classList.add('js');
    try {
        var saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
    } catch (error) {
        /* Storage blocked: fall back to the system theme */
    }
})();
