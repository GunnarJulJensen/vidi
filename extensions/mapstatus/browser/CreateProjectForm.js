import React from "react";

class CreateProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasChanged: false,
            projectInfo: { ...props.projectInfo }
        };
    }

    markHasChanged = () => {
        this.setState({ hasChanged: true });
        this.forceUpdate();
    }

    onProjectNameChange = (event) => {
        const value = event.target?.value;
        if (!value) return;
        this.setState ({
            projectInfo: {
                ...this.state.projectInfo,
                navn: value
            }
        });
        this.markHasChanged();
    }
    onProjectDescriptionChange = (event) => {
        const value = event.target?.value;
        if (!value) return;
        this.setState({
            projectInfo: {
                ...this.state.projectInfo,
                beskrivelse: value
            }
        });
        this.markHasChanged();
    }

    render() {
        const {
            projectInfo,
            onSaveClick,
            isNewProject,

        } = this.props;

        return (

            <div className="w-100">
                {isNewProject && (
                    <>
                        <input
                            type="text"
                            placeholder="Nyt projektnavn"
                            value={projectInfo.navn}
                            className=" my-2"
                            // onChange={(e) => this.onProjectNameChange(e)}
                        />
                        <br />
                    </>
                )}
                {!isNewProject || projectInfo.beskrivelse && (<><label >Projektbeskrivelse</label><br /></>)}
                <textarea
                    className="w-100"
                    readOnly={false}
                    //onChange={(e) => this.onProjectDescriptionChange(e)}
                    value={projectInfo.beskrivelse ? projectInfo.beskrivelse : ''}
                    placeholder="Projektbeskrivelse"
                />
                <br />
                {this.state.hasChanged && (
                    <>
                         <button className="btn btn-primary mt-2 w-100 " onClick={onSaveClick}>
                            {isNewProject ? 'Opret projekt' : 'Gem projekt'}
                        </button>
                    </>
                )}

            </div>
        );
    }
}

export default CreateProjectForm;
