import registerPlugins from './Plugins/RegisterPlugins';

export default (fred, pluginTools) => {
    const { Finder } = pluginTools;
    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    registerPlugins(fred, pluginTools);

    return (el, config, onInit, onChange, onFocus, onBlur) => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                const finalConfig = {
                    menubar: false,
                    inline: true,
                    toolbar: false,
                    plugins: 'quickbars modxlink image media lists powerpaste',
                    quickbars_insert_toolbar: "image media quicktable modxlink",
                    quickbars_selection_toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist numlist | modxlink h2 h3 h4 blockquote',
                    image_advtab: true,
                    branding: false,
                    relative_urls: false,
                    image_dimensions: false,
                    powerpaste_word_import: 'clean',
                    powerpaste_html_import: 'clean',
                    a11y_advanced_options: true,
                    skin: useDarkMode ? 'oxide-dark' : 'oxide',
                    ...config
                };
                // remove the theme if it is inlite
                if (finalConfig.theme === 'inlite') {
                    finalConfig.theme = null;
                }
                // clean up plugins list
                const renamePlugins = {
                    'contextmenu': ' ',
                    'hr': ' ',
                    'imagetools': ' ',
                };
                finalConfig.plugins = finalConfig.plugins.split(' ').map(plugin => {
                    return renamePlugins[plugin] || plugin;
                }).join(' ');
                // check if it is missing quickbars plugin
                if (!finalConfig.plugins.includes('quickbars')) {
                    finalConfig.plugins += ' quickbars';
                    if (finalConfig.insert_toolbar) {
                        finalConfig.quickbars_insert_toolbar = finalConfig.insert_toolbar;
                        delete finalConfig.insert_toolbar;
                    }
                    if (finalConfig.selection_toolbar) {
                        finalConfig.quickbars_selection_toolbar = finalConfig.selection_toolbar;
                        delete finalConfig.selection_toolbar;
                    }
                }
                // rename toolbar options
                const renameTools = {
                    'styleselect' : 'styles',
                };
                finalConfig.quickbars_insert_toolbar = finalConfig.quickbars_insert_toolbar.split(' ').map(tool => {
                    return renameTools[tool] || tool;
                }).join(' ');
                finalConfig.quickbars_selection_toolbar = finalConfig.quickbars_selection_toolbar.split(' ').map(tool => {
                    return renameTools[tool] || tool;
                }).join(' ');
                finalConfig.contextmenu = finalConfig.contextmenu.split(' ').map(tool => {
                    return renameTools[tool] || tool;
                }).join(' ');


                finalConfig.target = el;
                finalConfig.file_picker_callback = (callback, value, meta) => {
                    const finder = new Finder((file, fm) => {
                        const url = file.url;
                        const info = file.name;

                        if (meta.filetype == 'image') {
                            callback(url, {alt: info});
                            return;
                        }

                        callback(url);
                    }, 'fred.fe.browse_files', Finder.getFinderOptionsFromElement(el, (meta.filetype === 'image')));

                    finder.render();

                    return false;
                };

                finalConfig.setup = editor => {
                    el.rte = editor;

                    editor.on('change', e => {
                        onChange(editor.getContent());
                    });

                    editor.on('undo', e => {
                        onChange(editor.getContent());
                    });

                    editor.on('redo', e => {
                        onChange(editor.getContent());
                    });

                    editor.on('focus', e => {
                        onFocus();
                    });

                    editor.on('blur', e => {
                        onBlur()
                    });

                    onInit();
                    resolve();
                };


                tinymce.init(finalConfig);
            }, 1);
        });

        return promise;
    }
}
