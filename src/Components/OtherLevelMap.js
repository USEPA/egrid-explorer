import React, {Component} from 'react';
import '../App.css';
import * as d3 from 'd3';
import * as d3_composite from 'd3-composite-projections';
import * as topojson from 'topojson-client';

import subrgn from '../assets/data/json/SUBRGN.json';
import nerc from '../assets/data/json/NERC.json';
import ggl from '../assets/data/json/GGL.json';
import us from '../assets/data/json/US.json';

class OtherLevelMap extends Component {
    render() {
        const state_fullname = this.props.statefullnamedata;
        const subrgn_layer = topojson.feature(subrgn, 'subregion');
        const nerc_layer = topojson.feature(nerc, 'NERC');
        const state_layer = topojson.feature(us, 'states');
        const ggl_layer = topojson.feature(ggl, 'GGL');

        const projection = d3_composite.geoAlbersUsaTerritories().scale(this.props.scale).translate([this.props.width/2, this.props.height/2]);
        const pathGenerator = d3.geoPath().projection(projection);
        const fill_colors = this.props.fill_colors;

        let layer, label_width = 40;
        switch (this.props.layer_type) {
            case 'grid gross loss rates':
                ggl_layer.features.map(d=>d.name=d.properties.GGL);
                layer = ggl_layer;
                break
            case 'NERC region':
                nerc_layer.features.map(d=>d.name=d.properties.NERC);
                layer = nerc_layer;
                break
            case 'state':
                state_layer.features.map(d=>d.name=state_fullname.filter(e=>e.id===d.id)[0].name);
                layer = state_layer;
                label_width = 20;
                break
            default:
                subrgn_layer.features.map(d=>d.name=d.properties.Subregions);
                layer = subrgn_layer;
        }

        layer.features.map(d=>{
            let prop = this.props.data.filter(e=>e.name===d.name)[0] 
            ? this.props.data.filter(e=>e.name===d.name)[0] 
            : {name: d.name, unit: d.unit, value: null};
            prop.centroid = pathGenerator.centroid(d);
            d.properties = prop;
        });
        layer.features = layer.features.filter(d=>d.name!=='-');

        let fill_scale = d3.scaleThreshold().range(fill_colors);
        let domainArr = layer.features.map((e)=>e.properties.value).sort((a, b)=>a - b);
        fill_scale.domain(d3.range(fill_colors.length - 1).map(d=>d3.quantile(domainArr, (d + 1) / fill_colors.length)));

        let title = <text transform={'translate(' + this.props.width/2 + ',' + 80 + ')'} style={{fontSize: '1.2em', fontWeight: 'bold', fill: '#000', className: 'title', textAnchor: 'middle'}}>{this.props.title}</text>;
        let map = layer.features.map((d,i)=><path key={'path' + i + '_boundary'} d = {pathGenerator(d)} className='paths' style={{fill: this.props.layer_type!=='grid gross loss rates'? fill_scale(d.properties.value) : 'none'}}/>);
        let labels = layer.features.map((d,i)=><g key={'path' + i}>
                                                <rect key={'path' + i + '_rect'} x={d.properties.centroid[0]} y={d.properties.centroid[1]}
                                                width={label_width} height={12}
                                                rx={2}
                                                style={{fill: '#fff'}}/>
                                                <text key={'path' + i + '_text'}
                                                x={d.properties.centroid[0]+label_width/2} y={d.properties.centroid[1]+10}
                                                style={{textAnchor: 'middle', fontSize: '0.7em', fontWeight: 'bold'}}>{d.name}</text></g>);
        return ( 
            <svg width={this.props.width} height={this.props.height}>
                {title}{map}{labels}
            </svg>
        );
    }
}

export default OtherLevelMap;