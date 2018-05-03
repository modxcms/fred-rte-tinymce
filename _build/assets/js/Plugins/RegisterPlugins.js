import modxlink from './modxlink/modxlink';

export default (fred, fredConfig) => {
    tinymce.PluginManager.add('modxlink', modxlink(fred, fredConfig));
};