/*
 * @author     Alexander Shumilov
 * @copyright  2013-2019 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';

const API_URL = `/api/state-snapshots`;

import TitleFieldComponent from './../shared/TitleFieldComponent';

/**
 * @type {*|exports|module.exports}
 */
var cloud, anchor, utils, state, print, urlparser, serializeLayers, backboneEvents;

/**
 *
 * @type {exports|module.exports}
 */
const uuidv4 = require('uuid/v4');

const cookie = require('js-cookie');

let _self = false;

const exId = `state-snapshots`;

/**
 *
 * @type {{set: module.exports.set, init: module.exports.init}}
 */
module.exports = {
    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        anchor = o.anchor;
        cloud = o.cloud;
        state = o.state;
        print = o.print;
        urlparser = o.urlparser;
        serializeLayers = o.serializeLayers;
        backboneEvents = o.backboneEvents;
        utils = o.utils;

        _self = this;
        return this;
    },

    /**
     * Module initialization
     */
    init: function () {
        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');

        let buttonStyle = {
            padding: `4px`,
            margin: `0px`
        };

        /**
         *
         */
        class StateSnapshots extends React.Component {

            constructor(props) {
                super(props);

                this.state = {
                    browserOwnerSnapshots: [],
                    userOwnerSnapshots: [],
                    loading: false,
                    authenticated: false,
                    updatedItemId: false,
                    stateApplyingIsBlocked: false
                };

                this.applySnapshot = this.applySnapshot.bind(this);
                this.createSnapshot = this.createSnapshot.bind(this);
                this.deleteSnapshot = this.deleteSnapshot.bind(this);
                this.seizeSnapshot = this.seizeSnapshot.bind(this);               
                this.seizeAllSnapshots = this.seizeAllSnapshots.bind(this);
                this.copyToClipboard = this.copyToClipboard.bind(this);

                // Setting unique cookie if it have not been set yet
                let trackingCookie = uuidv4();
                if (cookie.get('vidi-state-tracker')) {
                    trackingCookie = cookie.get('vidi-state-tracker');
                } else {
                    cookie.set('vidi-state-tracker', trackingCookie);
                }
            }

            /**
             *
             */
            componentDidMount() {
                let _self = this;
                backboneEvents.get().on(`session:authChange`, (authenticated) => {
                    if (this.state.authenticated !== authenticated) {
                        this.setState({ authenticated });
                        this.refreshSnapshotsList();
                    }
                });

                this.refreshSnapshotsList();
            }

            /**
             * Returns the current meta settings of the snapshot
             * 
             * Meta remembers current configuration (config, template), so when state snapshots panel, for example,
             * will be opened for the same browser but with different configuration, generated snapshot
             * links will be correct
             */
            getSnapshotMeta() {
                let result = {};
                let queryParameters = urlparser.uriObj.search(true);
                if (`config` in queryParameters && queryParameters.config) {
                    result.config = queryParameters.config;
                }

                if (`tmpl` in queryParameters && queryParameters.tmpl) {
                    result.tmpl = queryParameters.tmpl;
                }

                return result;
            }

            /**
             * Creates snapshot
             * 
             * @param {Boolean} anonymous Specifies if the created snapshot belongs to browser or user
             */
            createSnapshot(title, anonymous = false) {
                let _self = this;

                _self.setState({ loading: true });
                state.getState().then(state => {
                    if ('modules' in state === false) {
                        throw new Error(`No modules data in state`);
                    }

                    state.map = anchor.getCurrentMapParameters();
                    state.meta = _self.getSnapshotMeta();
                    let data = {
                        title,
                        anonymous,
                        snapshot: state,
                        database: vidiConfig.appDatabase,
                        schema: vidiConfig.appDatabase,
                        host: urlparser.hostname
                    };

                    $.ajax({
                        url: API_URL + '/' + vidiConfig.appDatabase,
                        method: 'POST',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        data: JSON.stringify(data)
                    }).then(() => {
                        _self.setState({ loading: false });
                        _self.refreshSnapshotsList();
                    }).catch(error => {
                        console.error(error);
                        _self.setState({ loading: false });
                        _self.refreshSnapshotsList();
                    });
                });
            }

            /**
             * Applies snapshot
             * 
             * @param {Object} item Applies snapshot
             */
            applySnapshot(item) {
                this.setState({ stateApplyingIsBlocked: true });
                state.applyState(item.snapshot).then(() => {
                    this.setState({ stateApplyingIsBlocked: false });
                });
            }

            /**
             * Deletes snapshot
             * 
             * @param {String} id Snapshot identifier
             */
            deleteSnapshot(id) {
                if (confirm(`${__(`Delete state snapshot`)}?`)) {
                    let _self = this;
                    $.ajax({
                        url: `${API_URL}/${vidiConfig.appDatabase}/${id}`,
                        method: 'DELETE',
                        dataType: 'json'
                    }).then(data => {
                        _self.refreshSnapshotsList();
                    });
                }
            }

            /**
             * Updates snapshot
             * 
             * @param {String} id Snapshot identifier
             */
            updateSnapshot(data, title) {
                let _self = this;

                _self.setState({ loading: true });
                state.getState().then(state => {
                    if ('modules' in state === false) {
                        throw new Error(`No modules data in state`);
                    }

                    state.map = anchor.getCurrentMapParameters();

                    data.title = title;
                    data.snapshot = state;
                    data.snapshot.meta = _self.getSnapshotMeta();
                    $.ajax({
                        url: `${API_URL}/${vidiConfig.appDatabase}/${data.id}`,
                        method: 'PUT',
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify(data)
                    }).then(data => {
                        _self.refreshSnapshotsList();
                        _self.setState({
                            updatedItemId: false,
                            loading: false
                        });
                    });
                });
            }

            /**
             * Enables updat form for snapshot
             * 
             * @param {String} id Snapshot identifier
             */
            enableUpdateSnapshotForm(id) {
                this.setState({
                    updatedItemId: id
                });
            }

            /**
             * Makes state snapshot belong to user, not browser
             */
            seizeSnapshot(item) {
                let _self = this;
                if (confirm(`${__(`Add local state snapshot to user's ones`)}?`)) {
                    $.ajax({
                        url: `${API_URL}/${vidiConfig.appDatabase}/${item.id}/seize`,
                        method: 'PUT',
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8'
                    }).then(data => {
                        _self.refreshSnapshotsList();
                    });
                }
            }

            /**
             * Makes all state snapshots belong to user, not browser
             */
            seizeAllSnapshots() {
                if (confirm(`${__(`Add local state snapshots to user's ones`)}?`)) {
                    let _self = this;
                    let promises = [];
                    this.state.browserOwnerSnapshots.map(item => {
                        promises.push($.ajax({
                            url: `${API_URL}/${vidiConfig.appDatabase}/${item.id}`,
                            method: 'PUT',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8',
                            data: JSON.stringify({ anonymous: false })
                        }));
                    });

                    Promise.all(promises).then(() => {
                        _self.refreshSnapshotsList();
                    });
                }
            }


            /**
             * Retrives state snapshots list from server
             */
            refreshSnapshotsList() {
                let _self = this;

                this.setState({ loading: true });
                $.ajax({
                    url: API_URL + '/' + vidiConfig.appDatabase,
                    method: 'GET',
                    dataType: 'json'
                }).then(data => {
                    let browserOwnerSnapshots = [];
                    let userOwnerSnapshots = [];
                    data.map(item => {
                        if (item.browserId) {
                            browserOwnerSnapshots.push(item);
                        } else if (item.userId) {
                            userOwnerSnapshots.push(item);
                        } else {
                            throw new Error(`Invalid state snapshot`);
                        }
                    });

                    _self.setState({ browserOwnerSnapshots, userOwnerSnapshots, loading: false });
                }, (jqXHR) => {
                    if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error === `INVALID_OR_EMPTY_EXTERNAL_API_REPLY`) {
                        console.error(`Seems like Vidi is unable to access key-value storage capabilities, please check if the GC2 supports it (state snapshots module will be disabled)`);
                    }
                });
            }

            copyToClipboard (str) {
                const el = document.createElement('textarea');
                el.value = str;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            }

            /**
             * Renders the component
             * 
             * @returns {XML}
             */
            render() {
                let snapshotIdStyle = {
                    fontFamily: `"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace`,
                    marginRight: `10px`
                };

                const createSnapshotRecord = (item, index, local = false) => {
                    let date = new Date(item.created_at);
                    let dateFormatted = (`${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`);

                    let importButton = false;
                    if (local && this.state.authenticated) {
                        importButton = (<button type="button" className="btn btn-xs btn-primary" onClick={() => this.seizeSnapshot(item)} style={buttonStyle}>
                            <i title={__(`Add local state snapshot to user's ones`)} className="material-icons">person_add</i>
                        </button>);
                    }

                    let parameters = [];
                    parameters.push(`state=${item.id}`);

                    // Detecting not prioritized parameters from current URL
                    let highPriorityConfigString = false, lowPriorityConfigString = false;
                    let queryParameters = urlparser.uriObj.search(true);
                    if (`config` in queryParameters && queryParameters.config) {
                        lowPriorityConfigString = queryParameters.config;
                    }
                    
                    if (item.snapshot && item.snapshot.meta) {
                        if (item.snapshot.meta.config) {
                            highPriorityConfigString = item.snapshot.meta.config;
                        }

                        if (item.snapshot.meta.tmpl) {
                            parameters.push(`tmpl=${item.snapshot.meta.tmpl}`);
                        }
                    }

                    if (highPriorityConfigString) {
                        parameters.push(`config=${highPriorityConfigString}`);
                    } else if (lowPriorityConfigString) {
                        parameters.push(`config=${lowPriorityConfigString}`);
                    }

                    let permaLink = `${window.location.origin}${anchor.getUri()}?${parameters.join(`&`)}`;

                    let token = (item.token ? item.token : false);

                    let titleLabel = (<span style={snapshotIdStyle} title={item.id}>{item.id.substring(0, 6)}</span>);
                    if (item.title) {
                        titleLabel = (<span style={{marginRight: `10px`}} title={item.title}>{item.title.substring(0, 24)}</span>);
                    }

                    let updateSnapshotControl = (<button
                        type="button"
                        className="btn btn-xs btn-primary"
                        onClick={() => this.enableUpdateSnapshotForm(item.id)}
                        title={__(`Update state snapshot with current application state`)}
                        style={buttonStyle}>
                        <i className="material-icons">autorenew</i>
                    </button>);
                    if (this.state.updatedItemId === item.id) {
                        let type = (local ? 'browserOwned' : 'userOwned')
                        updateSnapshotControl = (<TitleFieldComponent
                            value={item.title}
                            onAdd={(newTitle) => { this.updateSnapshot(item, newTitle) }}
                            onCancel={() => { this.setState({ updatedItemId: false }) }}
                            type={type}/>);
                    }

                    let tokenField = false;
                    if (token) {
                        tokenField = (<div className="input-group form-group">
                            <a className="input-group-addon" style={{ cursor: `pointer` }} onClick={ () => { this.copyToClipboard(token) }}>{__(`copy token`)}</a>
                            <input className="form-control" type="text" defaultValue={token}/>
                        </div>);
                    }

                    return (<div className="panel panel-default" key={index} style={{marginBottom: '8px'}}>
                        <div className="panel-body" style={{padding: '8px'}}>
                            <div>
                                {titleLabel}
                                <span className="label label-default">{dateFormatted}</span>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-primary"
                                    onClick={() => { this.applySnapshot(item); }}
                                    disabled={this.state.stateApplyingIsBlocked}
                                    title={__(`Apply state snapshot`)}
                                    style={buttonStyle}>
                                    <i className="material-icons">play_arrow</i>
                                </button>
                                {updateSnapshotControl}
                                <button
                                    type="button"
                                    className="btn btn-xs btn-primary"
                                    onClick={() => this.deleteSnapshot(item.id)}
                                    title={__(`Delete state snapshot`)}
                                    style={buttonStyle}>
                                    <i className="material-icons">delete</i>
                                </button>
                                {importButton}
                            </div>
                            <div>
                                <div className="input-group form-group">
                                    <a className="input-group-addon" style={{ cursor: `pointer` }} onClick={ () => { this.copyToClipboard(permaLink) }}>{__(`copy link`)}</a>
                                    <input className="form-control" type="text" defaultValue={permaLink}/>
                                </div>
                                {tokenField}
                            </div>
                        </div>
                    </div>);
                };

                let browserOwnerSnapshots = (<div style={{textAlign: `center`}}>
                    {__(`No local snapshots`)}
                </div>);

                let importAllIsDisabled = true;
                if (this.state.browserOwnerSnapshots && this.state.browserOwnerSnapshots.length > 0) {
                    if (this.state.authenticated) importAllIsDisabled = false;

                    browserOwnerSnapshots = [];
                    this.state.browserOwnerSnapshots.map((item, index) => {
                        browserOwnerSnapshots.push(createSnapshotRecord(item, index, true));
                    });
                }

                let userOwnerSnapshots = (<div style={{textAlign: `center`}}>
                    {__(`No user snapshots`)}
                </div>);
                if (this.state.userOwnerSnapshots && this.state.userOwnerSnapshots.length > 0) {
                    userOwnerSnapshots = [];
                    this.state.userOwnerSnapshots.map((item, index) => {
                        userOwnerSnapshots.push(createSnapshotRecord(item, index));
                    });
                }

                let userOwnerSnapshotsPanel = false;
                if (this.state.authenticated) {
                    userOwnerSnapshotsPanel = (<div className="js-user-owned">
                        <div>
                            <h4>
                                {__(`User snapshots`)}
                                <TitleFieldComponent onAdd={(title) => { this.createSnapshot(title) }} type="userOwned"/>
                            </h4>
                        </div>
                        <div>
                            <div>{userOwnerSnapshots}</div>
                        </div>
                    </div>);
                }

                let overlay = false;
                if (this.state.loading) {
                    overlay = (<div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        opacity: '0.7',
                        zIndex:  '1000'
                    }}></div>);
                }

                return (<div>
                    {overlay}
                    <div>
                        <div className="js-browser-owned">
                            <div className="form-group">
                                <h4>
                                    {__(`Local snapshots`)} 
                                    <TitleFieldComponent onAdd={(title) => { this.createSnapshot(title, true) }} type="browserOwned"/>
                                    <button className="btn btn-xs btn-primary" onClick={this.seizeAllSnapshots} disabled={importAllIsDisabled} style={buttonStyle}>
                                        <i className="material-icons">person_add</i>
                                    </button>
                                </h4>
                            </div>
                            <div>
                                <div>{browserOwnerSnapshots}</div>
                            </div>
                        </div>
                        {userOwnerSnapshotsPanel}
                    </div>
                </div>);
            }
        }

        if (document.getElementById(exId)) {
            try {
                ReactDOM.render(<StateSnapshots/>, document.getElementById(exId));
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn(`Unable to find the container for offlineMap extension (element id: ${exId})`);
        }
    },

    /**
     * Fetches state snapshot by its identifier
     * 
     * @param {String} id State snapshot identifier
     * 
     * @return {Promise}
     */
    getSnapshotByID: (id) => {
        if (!id) {
            throw new Error(`Snapshot identifier was not provided`);
        }

        let result = new Promise((resolve, reject) => {
            $.getJSON(`${API_URL}/${vidiConfig.appDatabase}/${id}`).done((data) => {
                resolve(data);
            }).fail(() => {
                resolve(false);
            });
        });

        return result;
    }
};