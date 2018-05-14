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

$includes = '
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.7.9/tinymce.min.js"></script>
    <script type="text/javascript" src="' . $fredRTETinyMCE->getOption('webAssetsUrl') . 'fredrtetinymce.min.js"></script>
';
$beforeRender = '
    this.registerRTE("TinyMCE", FredRTETinyMCE);
';

$modx->event->_output = [
    'includes' => $includes, 
    'beforeRender' => $beforeRender,
    'lexicons' => ['fredrtetinymce:default']
];
return true;