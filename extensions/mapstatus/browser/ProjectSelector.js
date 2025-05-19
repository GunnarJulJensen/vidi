import React from "react";

class ProjectSelector extends React.Component {
    render() {
        const { projects, selectedProject, onSelectChange, onCreateClick, onStartClick } = this.props;
        return (
            <div className="mb-3">
                {Object.entries(projects).length > 0 && (
                    <div className="mb-3">  
                        <p>Vælg underprojekt</p>
                        <select
                            className="w-100"
                            value={selectedProject}
                            onChange={(e) => onSelectChange(e.target.value)}>
                            {projects.map((option, index) => (
                                <option key={index} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                        <div>
                            <button className="btn btn-primary mt-2 w-100 " onClick={onCreateClick}>
                                Start projekt
                            </button>
                        </div>
                    </div>
                )}
                {Object.entries(projects).length === 0 && (
                    <div className="mb-3">
                        <p>Ingen projekter tilgængelige eller der er ikke logget ind</p>
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
