import registerPlugins from './Plugins/RegisterPlugins';

export default (fred, pluginTools) => {
    const { Finder } = pluginTools;
    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    registerPlugins(fred, pluginTools);

    return (el, config, onInit, onChange, onFocus, onBlur) => {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                const lang = fred.rteLanguage || 'en';
                const finalConfig = {
                    menubar: false,
                    inline: true,
                    toolbar: false,
                    plugins: 'quickbars modxlink image media lists modai',
                    quickbars_insert_toolbar: "image media quicktable modxlink modai_generate",
                    quickbars_selection_toolbar: 'bold italic underline | alignleft aligncenter alignright | bullist numlist | modxlink h2 h3 h4 blockquote | modai_generate modai_enhance',
                    modai_enhance_prompts: [
                        {
                            label: "Proofread",
                            prompt: "Proofread and fix any spelling or grammar mistakes"
                        }, {
                            label: "Clarify",
                            prompt: "Improve this copy to eliminate unclear thoughts or awkward phrasing"
                        }, {
                            label: "Length",
                            prompts: [{
                                label: "Add a Paragraph",
                                prompt: "- Add a paragraph to this copy.\\n- You can rewrite the other copy if it enahances the copy\\n- Format it with HTML markup so it will work in the TinyMCE editor when pasted in."
                            }, {
                                label: "Add a Sentence",
                                prompt: "- Add a sentence to this copy that will improve it\\n- You can rewrite the other copy if it enahances the copy\\n- Format it with HTML markup so it will work in the TinyMCE editor when pasted in."
                            }, {
                                label: "Remove a Sentence",
                                prompt: "- Remove a sentence from this copy. Format it with HTML markup so it will work in the TinyMCE editor when pasted in."
                            }, {
                                label: "Cut in Half",
                                prompt: "- Condense this copy to roughly half of its current length\\n- Maintain important concepts and key topics\\n- Combine or eliminate paragraphs if it makes sense and helps with readability\\n- Format it with HTML markup so it will work in the TinyMCE editor when pasted in."
                            }]
                        }, {
                            label: "Reading Level",
                            prompts: [{
                                label: "Elementary",
                                prompt: "Rewrite this copy to ensure it is readable at an Elementary school reading level."
                            }, {
                                label: "High school",
                                prompt: "Rewrite this copy to ensure it is readable at a High school reading level."
                            }, {
                                label: "College",
                                prompt: "Rewrite this copy to ensure it is readable at a College reading level."
                            }]
                        }, {
                            label: "Change Tone",
                            prompts: [{
                                label: "Formal",
                                prompt: "Rewrite this with a formal tone."
                            }, {
                                label: "Conversational",
                                prompt: "Rewrite this with a casual, conversational tone."
                            }, {
                                label: "Professional",
                                prompt: "Rewrite this with a professional tone."
                            }, {label: "Humorous", prompt: "Rewrite this with a humorous tone."}, {
                                label: "Persuasive",
                                prompt: "Rewrite this with an persuasive tone."
                            }]
                        }],
                    image_advtab: true,
                    branding: false,
                    relative_urls: false,
                    image_dimensions: false,
                    language: lang,
                    language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6.8.5/langs/'+lang+'.js',
                    a11y_advanced_options: true,
                    contextmenu: '',
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
                if (finalConfig.contextmenu) {
                    finalConfig.contextmenu = finalConfig.contextmenu.split(' ').map(tool => {
                        return renameTools[tool] || tool;
                    }).join(' ');
                }
                if (finalConfig.autofocus) {
                    if (finalConfig.autofocus === false) {
                        delete finalConfig.autofocus;
                    }
                }

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
