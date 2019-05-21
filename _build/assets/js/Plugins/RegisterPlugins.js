import modxlink from './modxlink/modxlink';

export default (fred, pluginTools) => {
    tinymce.PluginManager.add('modxlink', modxlink(fred, pluginTools));
};
