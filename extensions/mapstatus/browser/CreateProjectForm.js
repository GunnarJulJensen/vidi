import React from "react";




class CreateProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          enableSaveButton: false,
        }
    }
    render() {

        const {
            projectInfo,
            onSaveClick,
            isNewProject,
            onProjectNameChanged,
            onProjectDescriptionChanged,
        } = this.props;
       

        return (
            <div className="w-100">
                {isNewProject && (
                    <>
                        <input
                            type="text"
                            placeholder="Nyt projektnavn"
                            value={projectInfo?.navn || ''}
                            className="w-100 my-2"
                            onChange={(e) => { 
                                onProjectNameChanged(e)
                                this.setState({ enableSaveButton: e.target.value.trim().length > 0 });
                            }}
                        />
                        <br />
                    </>
                )}
                {!isNewProject || projectInfo.beskrivelse && (
                    <>
                        <label >Projektbeskrivelse</label><br />
                    </>
                )}
                <textarea
                    className="w-100"
                    value={projectInfo?.beskrivelse || ''}
                    onChange={(e) =>{
                        this.setState({ enableSaveButton: e.target.value.trim().length > 0 });
                         onProjectDescriptionChanged(e)}
                        }
                    placeholder="Projektbeskrivelse..."
                />
                <>
                    <button disabled={!this.state.enableSaveButton} className="btn btn-primary mt-2 w-100 " onClick={onSaveClick}>
                        {isNewProject ? 'Opret projekt' : 'Gem projekt'}
                    </button>
                </>

            </div>
        );
    }
}

export default CreateProjectForm;
