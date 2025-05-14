import React from "react";

class FeatureTable extends React.Component {
    render() {
        const {
            features,
            selectedRowIndex,
            onRowClick,
            onCheckboxChange,
            onEditClick,
            rowRefs,
            styles
        } = this.props;

        return (
            <table className="table table-striped table-hover table-sm" style={styles.tableStyle}>
                <thead style={styles.theadStyle}>
                    <tr style={styles.rowStyle}>
                        <th style={{ width: '20px' }} ></th>
                        <th style={{ fontWeight: 'bold' }}>Opstr.</th>
                        <th style={{ fontWeight: 'bold' }}>Nedstr.</th>
                        <th style={{ fontWeight: 'bold' }}>System</th>
                        <th style={{ fontWeight: 'bold' }}>Kategori</th>
                        <th style={{ fontWeight: 'bold' }}>Materiale</th>
                        <th style={{ fontWeight: 'bold' }}>Rør diameter</th>
                        <th style={{ fontWeight: 'bold' }} >Længde</th>
                        <th style={{ fontWeight: 'bold' }}>Fra kote</th>
                        <th style={{ fontWeight: 'bold' }}>Til kote</th>
                        <th style={{ fontWeight: 'bold' }}>Dybde</th>
                        <th style={{ fontWeight: 'bold' }}>Fysisk indeks</th>
                        <th style={{ fontWeight: 'bold' }}>Bemærkning</th>
                        <th style={{ width: '20px' }}></th>
                    </tr>
                </thead>
                <tbody style={styles.tbodyStyle}>
                    {features.map((feature, index) => (
                        <tr
                            key={index}
                            ref={(el) => rowRefs[index] = el}
                            onClick={() => onRowClick(feature, index)}
                            style={{
                                cursor: 'pointer',
                                display: 'table',
                                width: '100%',
                                tableLayout: 'fixed',
                                border: selectedRowIndex === index ? '2px solid blue' : '1px solid gray',
                                fontWeight: selectedRowIndex === index ? '900' : 'normal'
                            }}
                        >
                            <td style={{ width: '20px' }}>
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
                            <td style={{ textAlign: 'center', width: '20px' }}>
                                <i className="bi bi-pen" onClick={() => onEditClick(feature.properties.id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        );
    }
}

export default FeatureTable;
