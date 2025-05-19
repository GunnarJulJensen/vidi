import React from "react";

class EditDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reperationMetode: [
                'Uoplyst',
                'Amkrete',
                'Foring med sammensvejste lange rør',
                'Injecering af samlinger',
                'Kortrørsforing',
                'Omstøbning',
                'Rørsprængning',
                'Rørsprængning+foring, korte rør',
                'Rørspængning+foring, lange rør',
                'Kort strømpe',
                'Stram foring',
                'Strømpeforing',
                'Udskiftning',
                'Andet'],

            terraenOverflade: [
                'Uoplyst',
                'Asfalt',
                'Belægningssten',
                'Betonfliser',
                'Brolægning',
                'Buskads',
                'Fortovsfliser',
                'Grus',
                'Græs',
                'Græsarmering',
                'Kantsten',
                'Træer',
                'Andet']

        };
    }
    render() {
        const { onBemChange, onClose, onSave, feature, styles } = this.props;
        return (
            <div style={styles.modalOverlay} >
                <div style={styles.modalContent} className="modalDialog" onClick={(e) => e.stopPropagation()}>
                    <div className="modalContent">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={onClose} data-dismiss="modal">&times;</button>
                            <h4 className="modal-title">Modal Header</h4>
                        </div>
                        <div>

                            <div className="modalBody">
                                <div className="row">
                                    <p><strong>Opstrøms brønd:</strong> {feature.properties.fra_brønd}</p>
                                    <p><strong>Nedstrøms brønd:</strong> {feature.properties.til_brønd}</p>
                                    <p><strong>System:</strong> {feature.properties.system}</p>
                                    <p><strong>Kategori:</strong> {feature.properties.kategori}</p>
                                    <p><strong>Materiale:</strong> {feature.properties.materiale}</p>
                                    <p><strong>Handelsmål:</strong> {feature.properties.handelsmål}</p>
                                    <p><strong>Længde:</strong> {feature.properties.længde}</p>
                                </div>
                                <label htmlFor="reperationMetode">Reperationsmetode</label>
                                <select
                                    className="w-100"
                                    id="reperationMetode"
                                // value={feature.properties.reperationMetode}
                                // onChange={(e) => this.props.onReperationMetodeChange(e.target.value)}
                                >
                                    {this.state.reperationMetode.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                                <label htmlFor="terraenOverflade">Terræn overflade</label>
                                <select
                                    className="w-100"
                                    id="terraenOverflade"
                                //value={feature.properties.reperationMetode}
                                //onChange={(e) => this.props.onReperationMetodeChange(e.target.value)}
                                >
                                    {this.state.reperationMetode.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                                <textarea autoFocus
                                    onChange={(e) => onBemChange(e.target.value)}
                                    value={feature.properties.bem}
                                    className="w-100"
                                    placeholder="Opgave beskrivelse"
                                />

                                <div className="modal-footer">
                                    <button type="button" className="btn btn.default" data-dismiss="modal" onClick={onClose}>Luk</button>
                                    <button type="button" className="btn btn.default" data-dismiss="modal" onClick={onSave}>Gem</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default EditDialog;
