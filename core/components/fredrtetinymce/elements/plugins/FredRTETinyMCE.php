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


try {
    $modAICorePath = $modx->getOption(
        'modai.core_path',
        null,
        $modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/modai/'
    );
    $modAI = $modx->getService(
        'modai',
        'modAI',
        $corePath . 'model/modai/',
        array(
            'core_path' => $corePath
        )
    );
} catch (\Exception $e) {
    $modAI = null;
}

$lit = $fredRTETinyMCE->getOption('last_install_time');
$tinyURL = $fredRTETinyMCE->getTinyMCEURL();

$includes = '
    <script src="' . $tinyURL . '"></script>
    <script type="text/javascript" src="' . $fredRTETinyMCE->getOption('webAssetsUrl') . 'fredrtetinymce.min.js?v='.$lit.'"></script>
    <link href="' . $fredRTETinyMCE->getOption('webAssetsUrl') . 'fredrtetinymce.css?v='.$lit.'" rel="stylesheet" />
';
$language = $modx->getOption('manager_language', null, 'en');
$beforeRender = '
    this.rteLanguage = "'.$language.'";
    this.registerRTE("TinyMCE", FredRTETinyMCE);
';

$lexicons = ['fredrtetinymce:default'];


if ($modAI) {
    $includes .= '
    <script type="text/javascript" src="' . $modAI->getJSFile().'"></script>
    ';

    $baseConfig = $modAI->getBaseConfig();

    $beforeRender .= '
    modAI = ModAI.init({
        ...' . json_encode($baseConfig) . ',
        translateFn: fred.getConfig().lng.bind(fred.getConfig())
    });
    ';

    foreach ($modAI->getUILexiconTopics() as $topic) {
        $lexicons[] = $topic;
    }
}

$modx->event->_output = [
    'includes' => $includes,
    'beforeRender' => $beforeRender,
    'lexicons' => $lexicons
];
return true;
