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
                <div style={styles.modalContent} className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={onClose} data-dismiss="modal">&times;</button>
                            <h4 className="modal-title">Modal Header</h4>
                        </div>
                        <div>

                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-sm-6">
                                        <label htmlFor="opstrømsBrønd">Opstrøms brønd</label>   
                                    </div>
                                    <div className="col-sm-6">    
                                        <p >{feature.properties.fra_brønd}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <label htmlFor="nedstrømsBrønd">Nedstrøms brønd</label>
                                    </div>
                                    <div className="col-sm-6">
                                        <p>{feature.properties.til_brønd}</p>
                                    </div>
                                </div>  
                                <div className="row">
                                    <div className="col-sm-6">  
                                        <label htmlFor="system">System</label>
                                    </div>
                                    <div className="col-sm-6">
                                        <p>{feature.properties.system}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <label htmlFor="kategori">Kategori</label>
                                    </div>
                                    <div className="col-sm-6">
                                        <p>{feature.properties.kategori}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <label htmlFor="materiale">Materiale</label>    
                                    </div>
                                    <div className="col-sm-6"> 
                                        <p>{feature.properties.materiale}</p>
                                    
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <label htmlFor="handelsmål">Handelsmål</label>
                                    </div>
                                    <div className="col-sm-6">  
                                        <p>{feature.properties.handelsmål}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">  
                                        <label htmlFor="længde">Længde</label>
                                    </div>
                                    <div className="col-sm-6">
                                        <p>{feature.properties.længde}</p>  
                                    </div>
                                </div>
                     
                                <hr></hr>
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
