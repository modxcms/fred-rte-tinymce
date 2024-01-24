import Data from './Data';
import Link from './Link';
import { unlinkSelection } from './Unlink';

export default (fred, pluginTools) => {
    const { fredConfig, fetch, Choices } = pluginTools;

    return (editor, url) => {
        const handleClick = () => {
            const dataHelper = new Data(editor);
            let activeTab = 0;

            const data = dataHelper.getData();
            const formsize = 40;

            const buildListItems = (inputList, itemCallback, startItems) => {
                function appendItems(values, output)
                {
                    output = output || [];

                    tinymce.each(values, function (item) {
                        var menuItem = {text: item.text || item.title};

                        if (item.items) {
                            menuItem.items = appendItems(item.items);
                        } else {
                            menuItem.value = item.value;

                            if (itemCallback) {
                                itemCallback(menuItem);
                            }
                        }

                        output.push(menuItem);
                    });

                    return output;
                }

                return appendItems(inputList, startItems || []);
            };
            const body = [{
                type: 'input',
                label: fredConfig.lng('fredrtetinymce.link_text'),
                name: 'link_text',
                size: formsize,
                onkeyup() {
                    data.link_text = this.value();
                }
            }];
            body.push({
                type: 'input',
                name: 'link_title',
                label: fredConfig.lng('fredrtetinymce.link_title'),
                size: formsize,
                onkeyup() {
                    data.link_title = this.value();
                }

            });
        if (editor.options.get('link_class_list')) {
            body.push({
                name: 'classes',
                type: 'listbox',
                label: fredConfig.lng('fredrtetinymce.classes'),
                size: formsize,
                items: buildListItems(
                    editor.options.get('link_class_list'),
                    function (item) {
                        if (item.value) {
                            item.textStyle = function () {
                                return editor.formatter.getCssText({inline: 'a', classes: [item.value]});
                            };
                        }
                    }
                ),
                onselect() {
                    data.classes = this.value();
                },
                });
        } else {
            body.push({
                type: 'input',
                name: 'classes',
                size: formsize,
                label: fredConfig.lng('fredrtetinymce.classes'),
                onkeyup() {
                    data.classes = this.value();
                }
                });
        }

            body.push({
                type: 'urlinput',
                name: 'url',
                label: fredConfig.lng('fredrtetinymce.url'),
                value: data.url.url,
                size: formsize,
                onkeyup() {
                    data.url.url = this.value();
                }
            });

            body.push({
                type: 'checkbox',
                name: 'new_window',
                size: formsize,
                label: fredConfig.lng('fredrtetinymce.new_window'),
                onchange() {
                    data.new_window = this.value();
                }
            });

            let node = editor.selection.getNode()
            const linkState = (node.nodeName == "A");

            // Open window
            const win = editor.windowManager.open({
                title: fredConfig.lng('fredrtetinymce.link_to'),
                classes: 'fred--modxlink',
                data,
                buttons: [
                    {
                        text: fredConfig.lng('fredrtetinymce.ok'),
                        primary: true,
                        type: 'submit',
                },{
                    text: linkState ? fredConfig.lng('fredrtetinymce.remove_link') : fredConfig.lng('fredrtetinymce.cancel'),
                    type: linkState ? 'custom' : 'cancel',
                    onclick() {
                        if (linkState) {
                            const el = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
                            editor.selection.select(el);
                            unlinkSelection(editor);
                        }

                        win.close();
                    }
                }
                ],
                body: {
                    type: 'panel',
                    name: 'panel',
                    items: body
                },
                onSubmit: (api) => {
                    const data = api.getData();
                    const linkHelper = new Link(editor);
                    const attributes = {
                        ...(Link.getGeneralAttributes(data, 'url')),
                        href: data.url.url
                    };

                    linkHelper.handleLink(data.link_text, attributes);

                    api.close();
                }
            });

        }
        
        editor.ui.registry.addButton('modxlink', {
            icon: 'link',
            tooltip: fredConfig.lng('fredrtetinymce.tooltip'),
            onAction: handleClick,
            stateSelector: 'a[href]'
        });

        editor.ui.registry.addMenuItem('modxlink', {
            icon: 'link',
            text: fredConfig.lng('fredrtetinymce.tooltip'),
            onAction: handleClick,
            stateSelector: 'a[href]'
        });

        return {
            getMetadata: function () {
                return {
                    name: "MODX Link",
                    url: "https://modx.com"
                };
            }
        };
    }
}
