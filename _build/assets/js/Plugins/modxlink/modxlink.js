import Data from './Data';
import Link from './Link';
import { unlinkSelection } from './Unlink';

export default (fred, pluginTools) => {
    const { fredConfig, fetch, Choices } = pluginTools;

    return (editor, url) => {
        const handleClick = () => {
            const dataHelper = new Data(editor);
            let currentTab = dataHelper.getActiveTab() ?? 'page';

            const data = dataHelper.getData();
            const lookupCache = {};
            let lookupTimeout = null;
            let initData = [];
            const formsize = 40;
            const choicesData = {
                'page_page': data.page_page,
                'page_url': data.page_url,
            };


            const linkOptions = [{
                type: 'input',
                label: fredConfig.lng('fredrtetinymce.link_text'),
                name: 'link_text',
                size: formsize,
            }];
            linkOptions.push({
                type: 'input',
                name: 'link_title',
                label: fredConfig.lng('fredrtetinymce.link_title'),
                size: formsize,

            });
            if (editor.options.get('link_class_list')) {
                linkOptions.push({
                    name: 'classes',
                    type: 'listbox',
                    label: fredConfig.lng('fredrtetinymce.classes'),
                    size: formsize,
                    values: buildListItems(
                        editor.options.get('link_class_list'),
                        function(item) {
                            if (item.value) {
                                item.textStyle = function() {
                                    return editor.formatter.getCssText({inline: 'a', classes: [item.value]});
                                };
                            }
                        }
                    ),
                });
            }else{
                linkOptions.push({
                    type: 'input',
                    name: 'classes',
                    size: formsize,
                    label: fredConfig.lng('fredrtetinymce.classes'),
                });
            }

            linkOptions.push({
                type: 'checkbox',
                name: 'new_window',
                size: formsize,
                label: fredConfig.lng('fredrtetinymce.new_window'),
            });

            const linkOptionsPanel = {
                type: 'panel',
                items: linkOptions
            };

            const tabPanel = {
                type: 'tabpanel',
                tabs: [
                    {
                        title: fredConfig.lng('fredrtetinymce.page'),
                        name: 'page',
                        items: [
                            linkOptionsPanel,
                            {
                                id: 'pagecontainer',
                                type: 'htmlpanel',
                                html: '<input type="hidden" name="page_page" /><label for="page_url">' + fredConfig.lng('fredrtetinymce.page_title') + '</label><select id="page_url"></select>'
                            },
                            {
                                type: 'input',
                                label: fredConfig.lng('fredrtetinymce.anchor'),
                                id: 'page_anchor',
                                name: 'page_anchor',
                                size: formsize,
                            },
                            {
                                type: 'input',
                                label: fredConfig.lng('fredrtetinymce.parameters'),
                                id: 'page_parameters',
                                name: 'page_parameters',
                                size: formsize,
                            },
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.url'),
                        name: 'url',
                        items: [
                            linkOptionsPanel,
                            {
                                type: 'input',
                                label: fredConfig.lng('fredrtetinymce.url'),
                                name: 'url_url',
                                size: formsize,
                            }
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.email'),
                        name: 'email',
                        items: [
                            linkOptionsPanel,
                            {
                                type: 'input',
                                label: fredConfig.lng('fredrtetinymce.to'),
                                name: 'email_to',
                                size: formsize,
                            },
                            {
                                type: 'input',
                                label: fredConfig.lng('fredrtetinymce.subject'),
                                size: formsize,
                                name: 'email_subject',
                            },
                            {
                                type: 'input',
                                multiline: true,
                                label: fredConfig.lng('fredrtetinymce.body'),
                                size: formsize,
                                name: 'email_body',
                            }
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.phone'),
                        name: 'phone',
                        items: [
                            linkOptionsPanel,
                            {
                                type: 'input',
                                label: fredConfig.lng('fredrtetinymce.phone'),
                                name: 'phone_phone',
                                size: formsize,
                            }
                        ]
                    },
                    {
                        title: fredConfig.lng('fredrtetinymce.file'),
                        name: 'file',
                        items: [
                            linkOptionsPanel,
                            {
                                type: 'urlinput',
                                label: fredConfig.lng('fredrtetinymce.file'),
                                name: 'file_file',
                                size: formsize,
                            }
                        ]
                    }
                ]
            };


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



            let node = editor.selection.getNode()
            const linkState = (node.nodeName == "A");

            // Open window
            const win = editor.windowManager.open({
                title: fredConfig.lng('fredrtetinymce.link_to'),
                initialData: data,
                buttons: [
                    {
                        text: fredConfig.lng('fredrtetinymce.ok'),
                        type: 'submit',
                    },{
                        text: linkState ? fredConfig.lng('fredrtetinymce.remove_link') : fredConfig.lng('fredrtetinymce.cancel'),
                        name: 'remove',
                        type: 'custom',
                    }
                ],
                onTabChange: (dialogApi, details) => {
                    currentTab = details.newTabName;

                    const input = document.querySelector('#page_url');
                    if (input) {
                        const templateInputChoices = new Choices(input, {
                            removeItemButton: true
                        });

                        templateInputChoices.ajax(callback => {
                            fetch(`${fredConfig.config.assetsUrl}endpoints/ajax.php?action=get-resources&current=${data.page_page}`, {
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
                                        templateInputChoices.setValueByChoice(data.page_page);

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

                        templateInputChoices.passedElement.addEventListener('search', event => {
                            clearTimeout(lookupTimeout);
                            lookupTimeout = setTimeout(serverLookup, 200);
                        });

                        templateInputChoices.passedElement.addEventListener('choice', event => {
                            templateInputChoices.setChoices(initData, 'value', 'pagetitle', true);

                            choicesData.page_page = event.detail.choice.value;
                            choicesData.page_url = event.detail.choice.customProperties.url;

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

                            choicesData.page_page = '';
                            choicesData.page_url = '';
                            const pageAnchorEl = document.getElementById('page_anchor-l');
                            if (pageAnchorEl) {
                                pageAnchorEl.innerText = fredConfig.lng('fredrtetinymce.block_on', {page: fredConfig.pageSettings.pagetitle});
                            }
                        });
                    }
                },
                onSubmit: (api) => {
                    const link = new Link(editor);
                    link.save(currentTab, {...api.getData(), ...choicesData});
                    api.close();
                },
                onAction: (api, details) => {
                    if (details.name !== 'remove') return;

                    if (linkState) {
                        const el = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
                        editor.selection.select(el);
                        unlinkSelection(editor);
                    }

                    api.close();
                },
                body: tabPanel,
            });
            win.showTab(currentTab);

            document.querySelectorAll('.tox-dialog').forEach((item) => {
                item.classList.add('fred');
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

            const input = document.querySelector('#page_url');
            if (input) {
                const templateInputChoices = new Choices(input, {
                    removeItemButton: true
                });

                templateInputChoices.ajax(callback => {
                    fetch(`${fredConfig.config.assetsUrl}endpoints/ajax.php?action=get-resources&current=${data.page_page}`, {
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
                                templateInputChoices.setValueByChoice(data.page_page);

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

                templateInputChoices.passedElement.addEventListener('search', event => {
                    clearTimeout(lookupTimeout);
                    lookupTimeout = setTimeout(serverLookup, 200);
                });

                templateInputChoices.passedElement.addEventListener('choice', event => {
                    templateInputChoices.setChoices(initData, 'value', 'pagetitle', true);
                    choicesData.page_page = event.detail.choice.value;
                    choicesData.page_url = event.detail.choice.customProperties.url;

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

                    choicesData.page_page = '';
                    choicesData.page_url = '';
                    const pageAnchorEl = document.getElementById('page_anchor-l');
                    if (pageAnchorEl) {
                        pageAnchorEl.innerText = fredConfig.lng('fredrtetinymce.block_on', {page: fredConfig.pageSettings.pagetitle});
                    }
                });
            }
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