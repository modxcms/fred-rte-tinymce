import registerPlugins from './Plugins/RegisterPlugins';

export default (fred, pluginTools) => {
    const { Finder } = pluginTools;

    registerPlugins(fred, pluginTools);

    return (el, config, onInit, onChange, onFocus, onBlur) => {
        setTimeout(() => {
            const finalConfig = {
                theme: 'inlite',
                inline: true,
                plugins: 'modxlink image imagetools media lists table',
                insert_toolbar: "image media table modxlink",
                selection_toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist numlist table | modxlink h2 h3 h4 blockquote',
                image_advtab: true,
                imagetools_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | flipv fliph | editimage imageoptions',
                auto_focus: false,
                branding: false,
                relative_urls: false,
                image_dimensions: false,
                ...config
            };

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
            };


            tinymce.init(finalConfig);
        }, 1);
    }
}
