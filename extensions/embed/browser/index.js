/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2023 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';

import React from 'react';
import {useState, useEffect, useRef} from "react";
import ReactDOM from 'react-dom';
import styled from "styled-components";


let backboneEvents;
let meta;
let state;
let layers;
let layerTree;

module.exports = {

    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        backboneEvents = o.backboneEvents;
        meta = o.meta;
        state = o.state;
        layers = o.layers;
        layerTree = o.layerTree;
        return this;
    },

    /**
     *
     */
    init: function () {
        backboneEvents.get().trigger('off:all');
        backboneEvents.get().trigger('on:infoClick');
        const imageSize = 36;
        const alt = window.vidiConfig?.extensionConfig?.embed?.useAltLayerTree;
        const Label = styled.label`
          cursor: pointer;
          display: flex;
          position: relative;
          width: ${imageSize}px;
          height: ${imageSize}px;
          box-sizing: unset;
          align-items: center;

          &:before {
            content: '';
            width: ${imageSize}px;
            height: ${imageSize}px;
            position: absolute;
            left: 0;
            box-sizing: border-box;
            background: url(${props => props.url}) left center no-repeat;
            background-size: cover;
          }
        `;

        const Input = styled.input`
          display: none;

          &:checked + label {
            box-shadow: 0 0 2px 3px rgba(255, 0, 0, .6);
          }
        `;

        const Checkbox = styled.div`
          width: ${imageSize + 3}px;
          height: ${imageSize + 3}px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        const Text = styled.div`
          min-width: 90px;
          font-size: 0.8em;
        `;

        const createId = () => (+new Date * (Math.random() + 1)).toString(36).substr(2, 5);

        const LayerGroup = (props) => {
            const id = 'a' + createId();
            return (
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button className="accordion-button text-uppercase" type="button" data-bs-toggle="collapse"
                                data-bs-target={"#" + id} aria-expanded="true" aria-controls="collapseOne">
                            {props.title}
                        </button>
                    </h2>

                    <div id={id} className="accordion-collapse collapse show">
                        <div className="accordion-body">
                            <div className="row row-cols-2 row-cols-md-3 gy-4">
                                {props.layerContols}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        const LayerControl = (props) => {
            const [checked, setChecked] = useState(props.checked);
            const toggleLayer = (e) => {
                setChecked(!checked);
            }
            return (
                <div className="d-flex align-items-center">
                    <Checkbox><Input onChange={toggleLayer} type={"checkbox"}
                                     checked={checked} data-gc2-id={props.id}
                                     id={'_ran_' + props.id}
                    />
                        <Label htmlFor={'_ran_' + props.id} url={props.url}>
                            <Text className="ms-5">{props.title}</Text>
                        </Label>
                    </Checkbox>
                </div>

            )
        }

        if (alt) {
            document.getElementById("layers").classList.add("d-none");
        }

        backboneEvents.get().on('layerTree:ready', () => {
            setTimeout(() => {
                const metaData = meta.getMetaDataKeys();
                let activeLayers = layerTree.getActiveLayers().map(e => e.split(':').reverse()[0]);
                const latestFullTreeStructure = layerTree.getLatestFullTreeStructure();
                let l = latestFullTreeStructure.map(g => {
                    return {
                        id: g.id, children: g.children.map(l => {
                            if (l.layer?.f_table_schema)
                                return {id: l.layer.f_table_schema + '.' + l.layer.f_table_name, type: 'layer'}
                        })
                    }
                })
                let groupsComps = []
                for (let i = 0; i < l.length; i++) {
                    let layerControls = l[i].children.map((e) => {
                            if (e) {
                                const title = metaData[e.id]?.f_table_title && metaData[e.id].f_table_title !== '' ? metaData[e.id].f_table_title : metaData[e.id]?.f_table_name;
                                return <LayerControl key={e.id} id={e.id} url={metaData[e.id].legend_url}
                                                     checked={activeLayers.includes(e.id)}
                                                     title={title}></LayerControl>
                            }
                        }
                    )
                    groupsComps.push(<LayerGroup key={l[i].id} title={l[i].id}
                                                 layerContols={layerControls}></LayerGroup>)
                }

                if (alt) {
                    const altNode = document.getElementById("layersAlt");
                    try {
                        ReactDOM.render(
                            <div className="accordion">{groupsComps}</div>,
                            altNode
                        );
                    } catch (e) {
                        console.error(e)
                    }
                    backboneEvents.get().on("layerTree:ready", () => {
                        ReactDOM.render(
                            <div className="accordion">{groupsComps}</div>,
                            altNode
                        );
                    })
                }
            }, 0)
        })
    }
}
