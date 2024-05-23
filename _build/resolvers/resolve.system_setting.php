<?php
if ($object->xpdo) {
    switch ($options[xPDOTransport::PACKAGE_ACTION]) {
        case xPDOTransport::ACTION_INSTALL:

            /** @var modX $modx */
            $modx =& $object->xpdo;

            /** @var modSystemSetting $setting */
            $setting = $modx->getObject('modSystemSetting', ['key' => 'fred.rte']);
            if ($setting) {
                $setting->set('value', 'TinyMCE');
                $setting->save();
            }
            $lit = $modx->getObject('modSystemSetting', ['key' => 'fredrtetinymce.last_install_time']);
            if (!$setting) {
                $lit = $modx->newObject('modSystemSetting');
                $lit->set('key', 'fredrtetinymce.last_install_time');
            }
            $lit->set('value', time());
            $lit->save();

            break;
    }
}
return true;