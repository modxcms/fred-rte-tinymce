import modxlink from './modxlink/modxlink';
import modai from './modai/modai';

export default (fred, pluginTools) => {
    tinymce.PluginManager.add('modxlink', modxlink(fred, pluginTools));
    tinymce.PluginManager.add('modai', modai);
};
