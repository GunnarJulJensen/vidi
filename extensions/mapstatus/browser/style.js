const styleObject = {

    boxStyle: {
        backgroundColor: '#d0d3db',
        border: '1px solid #000',
        bottom: '10px',
        cursor: 'grab',
        fontSize: '12px',
        height: 'auto',
        inset: 'unset',
        margin: '10px',
        maxHeight: '500px',
        overflow: 'hidden',
        padding: '5px',
        position: 'fixed',
        right: '75px',
        resize: 'both',
        width: '70vw',
        zIndex: 10200
    },
    modalOverlay: {

        position: 'fixed',
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
        overflowY: 'auto',
        maxHeight: '300px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },

    tableHeader: {
        position: 'sticky',
        top: 0,
        fontWeight: 'bold'
    },

    tableHeaderSmall: {
        position: 'sticky',
        top: 0,
        width: '20px',
        fontWeight: 'bold'
    },

    tableStyle: {
        width: '100%',
        borderCollapse: 'collapse',
        // tableLayout: 'fixed',
    },

    headerRow: {

        fontWeight: 'bold !important',
    },

    tbodyStyle: {
        maxHeight: '300px',
        overflowY: 'auto',
        width: '100%',
    },


    cellStyleHeader: {
        width: '100%',
        fontWeight: 'bold !important',
    },
    cellStyleLongText: {
        overflowWrap: 'break-word'
    },
    modalDialog: {
        display: 'block',
        paddingLeft: '0'
    },
    noFormUrl: {
        '--bsFormSelectBgImg': 'none'
    }


};
module.exports = styleObject;