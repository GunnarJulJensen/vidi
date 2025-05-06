const styleObject = {
    divContainer: {
        backgroundColor: '#9bc0e0',
        bottom: '75px',
        left: '550px',
        maxHeight: '30vh',
        marginLeft: '10px',
        marginRight: '10px',
        position: 'fixed',
        padding: '5px',
        right: '75px',
        zIndex: 1000,
        borderCollapse: 'collapse',
        fontSize: '12px'
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
    
    rowStyle:  {
        display: 'table',
        width: '100%',
        tableLayout: 'fixed',
        fontWeight: 'bold !important',
    },
    
    cellStyleHeader: {
        fontWeight: 'bold !important',
    }
    
};    
module.exports = styleObject;