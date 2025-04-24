/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2025 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud;

let sqlQuery;
let backboneEvents;
let state;
let bindEvent;
let drawControl;


/**
 *
 * @type {*|exports|module.exports}
 */
var utils;

/**
 *
 * @type {string}
 */
const exId = "mapstatus";
module.exports = {
    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        cloud = o.cloud;
        utils = o.utils;
        sqlQuery = o.sqlQuery;
        backboneEvents = o.backboneEvents;
        state = o.state;
        bindEvent = o.bindEvent;
        _self = this;
        
        return this;
    },
    /**
    *
    */
    

    init: function () {
        var dict = {};
        /**
         *
         */
        var React = require('react');

        /**
         *
         */
        var ReactDOM = require('react-dom');
        // $('.bi-layout-text-window').on('click', function () {
        //     alert("click on icon")
        //     if (_self) {
        //         _self.active(true);
        //     }
        // });
        backboneEvents.get().on(`reset:all reset:${exId}`, () => {
            _self.reset();
        });
        backboneEvents.get().on(`off:all`, () => {
            _self.off();
            // _self.reset();
        });
        backboneEvents.get().on(`on:${exId}`, () => {
            _self.active(true);
        });
      
        utils.createMainTab(exId, utils.__("MapStatus", dict), utils.__("Info", dict), require('./../../../browser/modules/height')().max, "bi bi-layout-text-window");
        
      
        class MapStatus extends React.Component {
            constructor(props) {
                super(props);
                this.state = {

                };
               
            }

            componentDidMount() {
                
                alert("componentDidMount")
            }

            componentDidUpdate(prevProps) {
                alert("componentDidUpdate")
            }


            render() {
                return (
                    <div role="tabpanel">
                        <p>GET TO WORK</p>
                    </div>
                );
            }
        }
        try {
            ReactDOM
                .render(
                    <MapStatus/>,
                    document
                        .getElementById(exId)
                )
            ;
        } catch
            (e) {

        }

    },
    off: () => {
        alert("off");
    },
    on : () => {
        alert("on");
    },
    reset: () => {
        alert("reset");
    },
    active: (active) => {
        alert("active " + active);
    },
    
};