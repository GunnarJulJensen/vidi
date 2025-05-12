import React from "react";

class CreateProjectForm extends React.Component {
    render() {
        const {
            projectName,
            onNameChange,
            onClose,
            onSave,
            isButtonEnabled,
        } = this.props;

        return (
            <div>
                <input
                    type="text"
                    placeholder="Projekt navn"
                    value={projectName}
                    className="w-100 my-2"
                    onChange={onNameChange}
                />
                <br />
                <textarea className="w-100" placeholder="Projekt beskrivelse" />
                <div className="modal-footer mt-2">
                    <button className="btn btn-primary me-2" onClick={onClose}>
                        Luk
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onSave}
                        disabled={!isButtonEnabled}
                    >
                        Gem
                    </button>
                </div>
            </div>
        );
    }
}

export default CreateProjectForm;
