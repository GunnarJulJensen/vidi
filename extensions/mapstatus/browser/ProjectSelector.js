import React from "react";

class ProjectSelector extends React.Component {
    render() {
        const { projects, selectedProject, onSelectChange, onCreateClick } = this.props;
        return (
            <div className="mb-3">
                <p>Vælg projekt</p>
                <select 
                    className="w-100"
                    value={selectedProject} 
                    onChange={(e) => onSelectChange(e.target.value) }>
                    {projects.map((option, index) => (
                        <option key={index} value={option.id}>{option.label}</option>
                    ))}
                </select>
                <div>
                    <button className="btn btn-primary mt-2 w-100 " onClick={onCreateClick}>
                        Opret nyt projekt
                    </button>
                </div>
            </div>
        );
    }
}

export default ProjectSelector;
