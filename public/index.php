<?php

use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    if (function_exists('header_remove')) {
        header_remove('X-Powered-By'); // PHP 5.3+
    } else {
        @ini_set('expose_php', 'off');
    }

    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
