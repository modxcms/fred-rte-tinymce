import registerPlugins from './Plugins/RegisterPlugins';

export default (fred, fredConfig) => {
    registerPlugins(fred, fredConfig);
    
    return (el, onInit, onChange, onFocus, onBlur) => {
        setTimeout(() => {
            tinymce.init({
                target: el,
                theme: 'inlite',
                inline: true,
                plugins: 'modxlink image imagetools',
                insert_toolbar: "image quicktable modxlink",
                selection_toolbar: 'bold italic | h2 h3 blockquote modxlink',
                image_advtab: true,
                imagetools_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | flipv fliph | editimage imageoptions',
                auto_focus: false,
                branding: false,
                relative_urls: false,
                file_picker_callback: (callback, value, meta) => {
                    const finder = new fred.Finder((file, fm) => {
                        const url = file.url;
                        const info = file.name + ' (' + fm.formatSize(file.size) + ')';

                        if (meta.filetype == 'image') {
                            callback(url, {alt: info});
                            return;
                        }

                        callback(url);
                    }, 'Browse Files', fred.Finder.getFinderOptionsFromElement(el, (meta.filetype === 'image')));

                    finder.render();

                    return false;
                },
                setup: editor => {
                    el.rte = editor;

                    editor.on('change', e => {
                        onChange(editor.getContent());
                    });

                    editor.on('focus', e => {
                        onFocus();
                    });

                    editor.on('blur', e => {
                        onBlur()
                    });

                    onInit();
                }
            });
        }, 1);
    }
}