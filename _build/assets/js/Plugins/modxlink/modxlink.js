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

            switch (dataHelper.getActiveTab()) {
                case 'page':
                    activeTab = 0;
                    break;
                case 'url':
                    activeTab = 1;
                    break;
                case 'email':
                    activeTab = 2;
                    break;
                case 'phone':
                    activeTab = 3;
                    break;
                case 'file':
                    activeTab = 4;
                    break;
            }

            const tabPanel = new tinymce.ui.TabPanel({
                type: 'tabpanel',
                classes: 'fred--modxlink-panel',
                activeTab,
                items: [
                    {
                        title: fredConfig.lng('fredrtetinymce.page'),
                        id: 'page',
                        type: 'form',
                        items: [
                            {
                                id: 'pagecontainer',
                                type: 'container',
                                html: '<label for="page_url">' + fredConfig.lng('fredrtetinymce.page_title') + '</label><select id="page_url"></select>'
                            },
                            {
                                type: 'textbox',
                                label: fredConfig.lng('fredrtetinymce.anchor'),
                                id: 'page_anchor',
                                value: data.page.anchor,
                                size: formsize,
                                onkeyup() {
                                    data.page.anchor = this.value();
                                }
                            },
                            {
                                type: 'textbox',
                                label: fredConfig.lng('fredrtetinymce.parameters'),
                                id: 'page_parameters',
                                value: data.page.parameters,
                                size: formsize,
                                onkeyup() {
                                    data.page.parameters = this.value();
                                }
                            }
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.url'),
                        id: 'url',
                        type: 'form',
                        items: [
                            {
                                type: 'textbox',
                                label: fredConfig.lng('fredrtetinymce.url'),
                                value: data.url.url,
                                size: formsize,
                                onkeyup() {
                                    data.url.url = this.value();
                                }
                            }
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.email'),
                        id: 'email',
                        type: 'form',
                        items: [
                            {
                                type: 'textbox',
                                label: fredConfig.lng('fredrtetinymce.to'),
                                value: data.email.to,
                                size: formsize,
                                onkeyup() {
                                    data.email.to = this.value();
                                }
                            },
                            {
                                type: 'textbox',
                                label: fredConfig.lng('fredrtetinymce.subject'),
                                value: data.email.subject,
                                size: formsize,
                                onkeyup() {
                                    data.email.subject = this.value();
                                }
                            },
                            {
                                type: 'textbox',
                                multiline: true,
                                label: fredConfig.lng('fredrtetinymce.body'),
                                value: data.email.body,
                                size: formsize,
                                onkeyup() {
                                    data.email.body = this.value();
                                }
                            }
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.phone'),
                        id: 'phone',
                        type: 'form',
                        items: [{
                            type: 'textbox',
                            label: fredConfig.lng('fredrtetinymce.phone'),
                            value: data.phone.phone,
                            size: formsize,
                            onkeyup() {
                                data.phone.phone = this.value();
                            }
                        }]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.file'),
                        id: 'file',
                        type: 'form',
                        items: [{
                            type: 'filepicker',
                            label: fredConfig.lng('fredrtetinymce.file'),
                            value: data.file.file,
                            size: formsize,
                            onchange(e) {
                                data.file.file = this.value();
                            }
                        }]
                    }
                ]
            });
            
            const buildListItems = (inputList, itemCallback, startItems) => {
                function appendItems(values, output) {
                    output = output || [];
        
                    tinymce.each(values, function(item) {
                        var menuItem = {text: item.text || item.title};
        
                        if (item.menu) {
                            menuItem.menu = appendItems(item.menu);
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

            const linkOptions = [{
                type: 'textbox',
                label: fredConfig.lng('fredrtetinymce.link_text'),
                name: 'link_text',
                size: formsize,
                onkeyup() {
                    data.link_text = this.value();
                }
            }];
            linkOptions.push({
                type: 'textbox',
                name: 'link_title',
                label: fredConfig.lng('fredrtetinymce.link_title'),
                size: formsize,
                onkeyup() {
                    data.link_title = this.value();
                }

            });
            if (editor.settings.link_class_list) {
                linkOptions.push({
                    name: 'classes',
                    type: 'listbox',
                    label: fredConfig.lng('fredrtetinymce.classes'),
                    size: formsize,
                    values: buildListItems(
                        editor.settings.link_class_list,
                        function(item) {
                            if (item.value) {
                                item.textStyle = function() {
                                    return editor.formatter.getCssText({inline: 'a', classes: [item.value]});
                                };
                            }
                        }
                    ),
                    onselect() {
                        data.classes = this.value();
                    },
                });
            }else{
                linkOptions.push({
                    type: 'textbox',
                    name: 'classes',
                    size: formsize,
                    label: fredConfig.lng('fredrtetinymce.classes'),
                    onkeyup() {
                        data.classes = this.value();
                    }
                });
            }

            linkOptions.push({
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
                        subtype: 'primary',
                        onclick () {
                            win.find('form')[0].submit();
                        }
                    },{
                        text: linkState ? fredConfig.lng('fredrtetinymce.remove_link') : fredConfig.lng('fredrtetinymce.cancel'),
                        onclick () {
                            if (linkState) {
                                const el = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
                                editor.selection.select(el);
                                unlinkSelection(editor);
                            }

                            win.close();
                        }
                    }
                ],
                body: [
                    {
                        type: 'form',
                        layout: 'grid',
                        padding: 0,
                        columns: 1,
                        items: linkOptions
                    },
                    tabPanel

                ],
                onsubmit: (tabPanel => {
                    return e => {
                        const link = new Link(editor);
                        const activeTab = tabPanel.items()[tabPanel.activeTabId.slice(1)]._id;

                        link.save(activeTab, data)
                    }
                })(tabPanel)
            });

            const input = document.querySelector('#page_url');

            let lookupTimeout = null;
            const lookupCache = {};
            let initData = [];

            const templateInputChoices = new Choices(input, {
                removeItemButton: true
            });
            templateInputChoices.ajax(callback => {
                fetch(`${fredConfig.config.assetsUrl}endpoints/ajax.php?action=get-resources&current=${data.page.page}`, {
                    credentials: 'same-origin',
                    headers: {
                        'X-Fred-Token': fredConfig.jwt
                    }
                })
                    .then(response => {
                        return response.json()
                    })
                    .then(json => {
                        initData = json.data.resources;
                        callback(json.data.resources, 'value', 'pagetitle');

                        if (json.data.current) {
                            templateInputChoices.setChoices([json.data.current], 'value', 'pagetitle', false);
                            templateInputChoices.setValueByChoice(data.page.page);

                            const pageAnchorEl = document.getElementById('page_anchor-l');
                            if (pageAnchorEl) {
                                pageAnchorEl.innerText = fredConfig.lng('fredrtetinymce.block_on', {page: json.data.current.pagetitle});
                            }
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });

            const populateOptions = options => {
                const toRemove = [];

                templateInputChoices.currentState.items.forEach(item => {
                    if (item.active) {
                        toRemove.push(item.value);
                    }
                });

                const toKeep = [];
                options.forEach(option => {
                    if (toRemove.indexOf(option.id) === -1) {
                        toKeep.push(option);
                    }
                });

                templateInputChoices.setChoices(toKeep, 'value', 'pagetitle', true);
            };

            const serverLookup = () => {
                const query = templateInputChoices.input.value;
                if (query in lookupCache) {
                    populateOptions(lookupCache[query]);
                } else {
                    fetch(`${fredConfig.config.assetsUrl}endpoints/ajax.php?action=get-resources&query=${query}`, {
                        credentials: 'same-origin',
                        headers: {
                            'X-Fred-Token': fredConfig.jwt
                        }
                    })
                        .then(response => {
                            return response.json()
                        })
                        .then(data => {
                            lookupCache[query] = data.data.resources;
                            populateOptions(data.data.resources);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
            };

            templateInputChoices.passedElement.addEventListener('search', event => {
                clearTimeout(lookupTimeout);
                lookupTimeout = setTimeout(serverLookup, 200);
            });

            templateInputChoices.passedElement.addEventListener('choice', event => {
                templateInputChoices.setChoices(initData, 'value', 'pagetitle', true);
                data.page.page = event.detail.choice.value;
                data.page.url = event.detail.choice.customProperties.url;

                if (!data.link_text) {
                    data.link_text = event.detail.choice.label;
                    linkText.value(event.detail.choice.label);
                }

                const pageAnchorEl = document.getElementById('page_anchor-l');
                if (pageAnchorEl) {
                    pageAnchorEl.innerText = fredConfig.lng('fredrtetinymce.block_on', {page: event.detail.choice.label});
                }
            });

            templateInputChoices.passedElement.addEventListener('removeItem', event => {
                if (templateInputChoices.getValue()) return;

                data.page.page = '';
                data.page.url = '';
                const pageAnchorEl = document.getElementById('page_anchor-l');
                if (pageAnchorEl) {
                    pageAnchorEl.innerText = fredConfig.lng('fredrtetinymce.block_on', {page: fredConfig.pageSettings.pagetitle});
                }
            });

        }
        
        editor.addButton('modxlink', {
            icon: 'link',
            tooltip: fredConfig.lng('fredrtetinymce.tooltip'),
            onclick: handleClick,
            stateSelector: 'a[href]'
        });

        editor.addMenuItem('modxlink', {
            icon: 'link',
            text: fredConfig.lng('fredrtetinymce.tooltip'),
            onclick: handleClick,
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
