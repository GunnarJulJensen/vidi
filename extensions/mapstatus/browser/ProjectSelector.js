import React from "react";

class ProjectSelector extends React.Component {
    render() {
        const {
            isLoggedIn,
            projects,
            selectedProject,
            onSelectChange,
            onCreateClick,
            onStartClick
        } = this.props;
        const showNewProject = selectedProject?.id === 0;

        return (
            <div className="mb-3">
                {isLoggedIn && Object.entries(projects).length > 0 && (
                    <div className="mb-3">
                        <p>Vælg projekt</p>
                        <select
                            className="w-100"
                            value={selectedProject?.id}
                            onChange={(e) => onSelectChange(e.target.value)}>
                            {projects.map((option, index) => (
                                <option
                                    key={index}
                                    value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {showNewProject && (<div>
                            <button className="btn btn-primary mt-2 w-100 " onClick={onCreateClick}>
                                Opret nyt projekt
                            </button>
                        </div>)}
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="mb-3">
                        <p>Login og tryk på start</p>
                        <button className="btn btn-primary mt-2 w-100 " onClick={onStartClick}>
                            Start
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default ProjectSelector;
