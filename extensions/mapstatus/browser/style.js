const height = require("../../../browser/modules/height");

const styleObject = {

    boxStyle: {
        backgroundColor: '#9bc0e0',
        bottom: '10px',
        cursor: 'grab',
        fontSize: '12px',
        height: 'auto',
        inset: 'unset',
        marginLeft: '10px',
        marginRight: '10px',
        maxHeight: '500px',
        padding: '5px',
        position: 'fixed',
        right: '75px',
        resize: 'both',
        width: '70vw',
        zIndex: 10200
    },
    modalOverlay: {
        
        position:'fixed',
        zIndex: 10201,
        top: 0,
        left: 0, 
        right: 0, 
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
    },
      
    modalContent: {
        background: 'white',
        padding: '20px',
        margin: '10% auto',
        width: '400px',
        borderRadius: '8px'
    },

    tableContainer: {
        display: 'block',
        textAlign: 'center',
    },

    tableHeader: {
        position: 'sticky',
        top: 0,
        fontSize: '1.2em',
        fontWeight: 'bold !important',
        display: 'table',
        width: '100%',
        tableLayout: 'fixed'
    },

    scrollable: {
        display: 'block',
        overflowY: 'auto',
        maxHeight: '300px',
        width: '100%',
    },
    tableRow: {
        display: 'table',
        width: '100%',
        tableLayout: 'fixed'
    },
    tableStyle: {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
    },

    theadStyle: {
        display: 'table',
        width: '100%',
        tableLayout: 'fixed',
        position: 'sticky',
        top: 0,
        backgroundColor: '#f2f2f2',
        zIndex: 2,
    },

    tbodyStyle: {
        display: 'block',
        maxHeight: '300px',
        overflowY: 'auto',
        width: '100%',
    },

    rowStyle: {
        display: 'table',
        width: '100%',
        tableLayout: 'fixed',
        fontWeight: 'bold !important',
    },

    cellStyleHeader: {
        fontWeight: 'bold !important',
    },
    cellStyleLongText: {
       overflowWrap: 'break-word'
    },
    modalDialog: {
        display: 'block',
        paddingLeft: '0'
        // position: 'fixed',
        // top: '50%',
        // left: '50%',
        // transform: 'translate(-50%, -50%)',
        // backgroundColor: '#fff',
        // padding: '20px',
        // zIndex: 1000,
        // borderRadius: '8px',
        // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },

};
module.exports = styleObject;