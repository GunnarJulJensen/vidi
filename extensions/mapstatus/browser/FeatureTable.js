import React from "react";
import styleObject from "./style";

class FeatureTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            features: props.features || [],
            sortKey: null,
            sortDirection: 'asc'
        };
        this.columns = [
            { key: '#', label: '' , isNumeric: false},
            { key: 'fra_brønd', label: 'Opstr.', isNumeric: false },
            { key: 'til_brønd', label: 'Nedstr.', isNumeric: false },
            { key: 'system', label: 'System' , isNumeric: false},
            { key: 'kategori', label: 'Kategori' , isNumeric: false},
            { key: 'materiale', label: 'Materiale', isNumeric: false },
            { key: 'handelsmål', label: 'Rør diameter', isNumeric: true },
            { key: 'længde', label: 'Længde' , isNumeric: true},
            { key: 'fra_kote', label: 'Fra kote' , isNumeric: true},
            { key: 'til_kote', label: 'Til kote' , isNumeric: true},
            { key: 'dybde', label: 'Dybde', isNumeric: true },
            { key: 'fysiskindeks', label: 'Fysisk indeks' , isNumeric: true},
            { key: 'bem', label: 'Bemærkning' , isNumeric: false},
            { key: 'cmd', label: '' , isNumeric: false},
        ];

    }
    componentDidUpdate(prevProps) {
        if (prevProps.features !== this.props.features) {
            this.setState({ features: this.props.features });
        }
    }
    handleHeaderClick = (event) => {
        if (event.target.tagName !== 'TH') return;
        const clickedIndex = event.target.cellIndex;
        const column = this.columns[clickedIndex];
        const sortKey = this.columns[clickedIndex].key;
 
        const isSameColumn = this.state.sortKey === sortKey;
        const newDirection = isSameColumn && this.state.sortDirection === 'asc' ? 'desc' : 'asc';

        const sortedData = [...this.state.features].sort((a, b) => {
            const valA = column.isNumeric ? Number(a.properties[sortKey]) : a.properties[sortKey].toLowerCase();
            const valB = column.isNumeric ? Number(b.properties[sortKey]) : b.properties[sortKey].toLowerCase();
            if (valA < valB) return newDirection === 'asc' ? -1 : 1;
            if (valA > valB) return newDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.setState({ 
            features: sortedData,
            sortKey,
            sortDirection: newDirection
        });
        this.forceUpdate()
    };
    render() {
        const {
            selectedRowIndex,
            onRowClick,
            onCheckboxChange,
            onEditClick,
            rowRefs,
            styles
        } = this.props;
       const { features, sortKey, sortDirection } = this.state;
        return (
            <div className="container mt-4">
                <div style={styleObject.tableContainer}>
                    <table className="table table-striped table-bordered table-hover table-sm" style={styles.tableStyle}>
                        <thead onClick={(e) => this.handleHeaderClick(e)}>
                            <tr style={styles.headerRow} >
                                {this.columns.map((col, index) => (
                                    <th key={index}
                                        style={index === 0 || index === this.columns.length - 1 ? styleObject.tableHeaderSmall : styleObject.tableHeader} >
                                        {col.label}
                                        {sortKey === col.key && (
                                            <span className="ms-1">
                                                {sortDirection === 'asc' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </th>
                                ))}
                                {/* <th style={styleObject.tableHeaderSmall}></th>
                                <th style={styleObject.tableHeader}>Opstr.</th>
                                <th style={styleObject.tableHeader}>Nedstr.</th>
                                <th style={styleObject.tableHeader}>System</th>
                                <th style={styleObject.tableHeader}>Kategori</th>
                                <th style={styleObject.tableHeader}>Materiale</th>
                                <th style={styleObject.tableHeader}>Rør diameter</th>
                                <th style={styleObject.tableHeader}>Længde</th>
                                <th style={styleObject.tableHeader}>Fra kote</th>
                                <th style={styleObject.tableHeader}>Til kote</th>
                                <th style={styleObject.tableHeader}>Dybde</th>
                                <th style={styleObject.tableHeader}>Fysisk indeks</th>
                                <th style={styleObject.tableHeader}>Bemærkning</th>
                                <th style={styleObject.tableHeaderSmall}></th> */}
                            </tr>
                        </thead>
                        <tbody style={styles.tbodyStyle}>
                            {features.map((feature, index) => (
                                <tr
                                    key={index}
                                    ref={(el) => rowRefs[index] = el}
                                    onClick={() => onRowClick(feature, index)}
                                    className="tableInfo"
                                    style={{
                                        border: selectedRowIndex === index ? '2px solid blue' : '1px solid gray',
                                        fontWeight: selectedRowIndex === index ? 'bold' : 'normal'
                                    }}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            onClick={(e) => e.stopPropagation()}
                                            checked={feature.properties.isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onCheckboxChange(feature.properties.id, e.target.checked);
                                            }}
                                        />
                                    </td>
                                    <td style={styles.cellStyleLongText}>{feature.properties.fra_brønd}</td>
                                    <td style={styles.cellStyleLongText}>{feature.properties.til_brønd}</td>
                                    <td>{feature.properties.system}</td>
                                    <td>{feature.properties.kategori}</td>
                                    <td>{feature.properties.materiale}</td>
                                    <td>{feature.properties.handelsmål}</td>
                                    <td>{feature.properties.længde}</td>
                                    <td>{feature.properties.fra_kote}</td>
                                    <td>{feature.properties.til_kote}</td>
                                    <td>MANGLER!</td>
                                    <td>{feature.properties.fysiskindeks}</td>
                                    <td style={styles.cellStyleLongText}>{feature.properties.bem}</td>
                                    <td >
                                        <i className="bi bi-pen" onClick={() => onEditClick(feature.properties.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        );
    }
}

export default FeatureTable;
