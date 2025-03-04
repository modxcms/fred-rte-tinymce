<?php
$corePath = $modx->getOption('fredrtetinymce.core_path', null, $modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/fredrtetinymce/');
/** @var FredRTETinyMCE $fredRTETinyMCE */
$fredRTETinyMCE = $modx->getService(
    'fredrtetinymce',
    'FredRTETinyMCE',
    $corePath . 'model/fredrtetinymce/',
    array(
        'core_path' => $corePath
    )
);

$lit = $fredRTETinyMCE->getOption('last_install_time');

$includes = '
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.5/tinymce.min.js" integrity="sha512-7QeC6Wn55MHBHO1O7ntUM/zfrx79lPQZo82PTVzO3SC+2fPmBBPWk+MUc7mZib3vRkG8ub9Jl3yUY3iXAyQYfw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script type="text/javascript" src="' . $fredRTETinyMCE->getOption('webAssetsUrl') . 'fredrtetinymce.min.js?v='.$lit.'"></script>
    <link href="' . $fredRTETinyMCE->getOption('webAssetsUrl') . 'fredrtetinymce.css?v='.$lit.'" rel="stylesheet" />
';
$language = $modx->getOption('manager_language', null, 'en');
$beforeRender = '
    this.rteLanguage = "'.$language.'";
    this.registerRTE("TinyMCE", FredRTETinyMCE);
';

$modx->event->_output = [
    'includes' => $includes, 
    'beforeRender' => $beforeRender,
    'lexicons' => ['fredrtetinymce:default']
];
return true;