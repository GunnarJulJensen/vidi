import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import LoadingOverlay from './../../shared/LoadingOverlay';

/**
 * Interface for applying application configurations
 */
class ConfigSwitcher extends React.Component {
    constructor(props) {
        super(props);

        if (!gc2host) throw new Error(`Unable to detect GC2 host to pull configurations from`);

        const appDatabase = (vidiConfig.appDatabase ? vidiConfig.appDatabase : false);
        if (!appDatabase) throw new Error(`Unable to detect database`);

        this.state = {
            configSourceURL: `/api/v2/configuration/${appDatabase}`,
            loading: false,
            configurations: []
        };
    }

    componentDidMount() {
        this.updateConfigurationsList();
    }

    updateConfigurationsList() {
        this.setState({loading: true});
        const gc2host = (vidiConfig.gc2 && vidiConfig.gc2.host ? vidiConfig.gc2.host : false);
        axios.get(`/api/requestProxy?request=${encodeURIComponent(gc2host + this.state.configSourceURL)}`).then(response => {
            let configurations = [];
            if (`data` in response.data && Array.isArray(response.data.data)) {
                configurations = response.data.data;
            }

            this.setState({
                loading: false,
                configurations
            });
        }).catch(error => {
            console.error(error);
            this.setState({loading: false});
        });
    }

    applyConfiguration(configuration) {
        let parameters = this.props.urlparser.urlVars;
        parameters.config = configuration;
        let parametersArray = [];
        for (let key in parameters) {
            parametersArray.push(`${key}=${parameters[key]}`);
        }

        let changedUrl = location.origin + location.pathname + `?` + parametersArray.join(`&`) + location.hash;
        document.location.href = changedUrl;
    }

    copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    /**
     *
     * @returns {React.JSX.Element}
     */
    render() {
        let overlay = false;
        if (this.state.loading) {
            overlay = (<LoadingOverlay/>);
        }

        let refreshButton = (<button
            type='button'
            className='btn btn-outline-secondary btn-sm'
            style={{margin: '0px'}}
            onClick={this.updateConfigurationsList.bind(this)}>{__('Refresh')}</button>);

        let configurationControls = false;
        if (this.state.configurations && this.state.configurations.length > 0) {
            let configurationControlItems = [];
            this.state.configurations.map((item, index) => {
                let parsedValue = JSON.parse(item.value);
                let url = `${this.state.configSourceURL}/${item.key}.json`;
                configurationControlItems.push(<li key={`configuration_${index}`} className="list-group-item">
                    <div className="d-flex align-items-center">
                        <div><b>{parsedValue.name}</b></div>
                        {parsedValue.published === false ? (<i className="bi bi-lock"
                                                               title={__(`Configuration is not published yet`)}></i>) : false}
                        <div className="flex-grow-1 ms-3 me-3 ms-sm-4 me-sm-4">{parsedValue.description ? `${parsedValue.description}` : ``}</div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{margin: `0px`}}
                            onClick={() => {
                                this.applyConfiguration(url);
                            }}><i className="bi bi-play"></i> <span className="d-none d-md-inline">{__(`Apply`)}</span></button>
                    </div>
                </li>);
            });

            configurationControls = (<div>
                <ul className="list-group">{configurationControlItems}</ul>
                <div className="d-flex align-items-center mt-2">
                    <div className="me-3">{__(`Total configurations`)}: {this.state.configurations.length}</div>
                    <div className="">{refreshButton}</div>
                </div>
            </div>);
        } else {
            configurationControls = (<div className="d-flex align-items-center mt-2">
                <div className="me-3">{__(`No configurations to display`)}</div>
                <div className="">{refreshButton}</div>
            </div>);
        }

        return (<div>
            {overlay}
            <div>
                <div>{configurationControls}</div>
            </div>
        </div>);
    }
}

ConfigSwitcher.propTypes = {
    urlparser: PropTypes.object.isRequired,
};

export default ConfigSwitcher;