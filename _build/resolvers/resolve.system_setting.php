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

            break;
    }
}
return true;