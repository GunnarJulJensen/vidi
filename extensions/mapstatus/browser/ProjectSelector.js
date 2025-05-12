import React from "react";

class ProjectSelector extends React.Component {
    render() {
        const { projects, selectedProject, onSelectChange, onCreateClick } = this.props;
        return (
            <div className="mb-3">
                <p>Vælg projekt</p>
                <select value={selectedProject} onChange={onSelectChange}>
                    {projects.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
                <div>
                    <button className="btn btn-primary mt-2" onClick={onCreateClick}>
                        Opret nyt projekt
                    </button>
                </div>
            </div>
        );
    }
}

export default ProjectSelector;
