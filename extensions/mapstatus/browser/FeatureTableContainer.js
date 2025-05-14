import React from "react";

class FeatureTableContainer extends React.Component {
    render() {
        const { children, style, headerText, onSave } = this.props;

        return (
            <div style={{ ...style }} >

                <h5>{headerText}</h5>
                <button
                    className="btn btn-primary"
                    onClick={onSave}
                >
                    <i className="bi bi-save me-2"></i>
                    Gem
                </button>
                <div >
                    {children}
                </div>

            </div>
        );
    }
}

export default FeatureTableContainer;