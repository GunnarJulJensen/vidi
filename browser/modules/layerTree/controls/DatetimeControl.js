/*
 * @author     Alexander Shumilov
 * @copyright  2013-2023 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const FORMAT = `YYYY-MM-DD HH:mm:ss`;

/**
 * Datetime control component
 */
class DatetimeControl extends React.Component {
    constructor(props) {
        super(props);
        dayjs.locale(navigator.language.indexOf(`da_`) === 0 ? "da" : "en");
    }

    render() {
        return (<input
            id={this.props.id}
            className="form-control form-control-sm"
            type="datetime-local"
            placeholder=""
            value={this.props.value}
            onChange={(event) => { this.props.onChange(event.target.value) }}/>);
    }
}

DatetimeControl.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export { DatetimeControl };
