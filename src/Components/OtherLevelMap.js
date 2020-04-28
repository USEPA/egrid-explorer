import React, {Component} from 'react';
import '../App.css';
import * as d3 from 'd3';
import * as d3_composite from 'd3-composite-projections';




class OtherLevelMap extends Component {
    render() {
        const projection = d3_composite.geoAlbersUsaTerritories().scale(this.props.scale).translate([this.props.width/2, this.props.height/2]);
        const path = d3.geoPath().projection(projection);
        const mapfill = this.props.mapfill;
        
        let layer = this.props.layer, label_width = 40;

        layer.features.map(d=>{
            let prop = this.props.data.filter(e=>e.name===d.name)[0] 
            ? this.props.data.filter(e=>e.name===d.name)[0] 
            : {name: d.name, unit: d.unit, value: null};
            prop.centroid = path.centroid(d);
            d.properties = prop;
        });

        let fill_scale = d3.scaleThreshold().range(mapfill);
        let domainArr = layer.features.map((e)=>e.properties.value).sort((a, b)=>a - b);
        fill_scale.domain(d3.range(mapfill.length-1).map(d=>d3.quantile(domainArr, (d + 1) / mapfill.length)));

        let title = <text transform={'translate(' + this.props.width/2 + ',' + this.props.height/8 + ')'} style={{fontSize: '1.2em', fontWeight: 'bold', fill: '#000', className: 'title', textAnchor: 'middle'}}>{this.props.title}</text>;
        let map = layer.features.map((d,i)=><path key={'path' + i + '_boundary'} d = {path(d)} className='paths' style={{fill: this.props.layer_type!=='grid gross loss rates'? fill_scale(d.properties.value) : 'none'}}/>);
        let labels = layer.features.map((d,i)=><g key={'path' + i + '_label'}>
                                                <rect x={d.properties.centroid[0]} y={d.properties.centroid[1]}
                                                width={label_width} height={12}
                                                rx={2}
                                                style={{fill: '#fff'}}/>
                                                <text
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