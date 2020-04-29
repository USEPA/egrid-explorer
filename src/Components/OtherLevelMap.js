import React, {Component} from 'react';
import '../App.css';
import * as d3 from 'd3';
import * as d3_composite from 'd3-composite-projections';




class OtherLevelMap extends Component {
    render() {
        const projection = d3_composite.geoAlbersUsaTerritories().scale(this.props.scale).translate([this.props.width/2, this.props.height/2]);
        const path = d3.geoPath().projection(projection);
        const mapfill = this.props.mapfill;
        
        let layer = this.props.layer, label_width = this.props.layer_type!=='grid gross loss rates' ? 40 : 65, label_height = this.props.layer_type!=='grid gross loss rates' ? 14 : 22;

        layer.features = layer.features.map(d=>{
          if (this.props.data.filter(e=>e.name===d.name)[0] ) {
            let prop = this.props.data.filter(e=>e.name===d.name)[0];
            prop.centroid = path.centroid(d);
            d.properties = prop;
          } else {
            d.properties = null;
          }
          return d;
        }).filter(d=>d.properties!==null);

        let fill_scale = d3.scaleThreshold().range(mapfill);
        let domainArr = layer.features.map((e)=>e.properties.value).sort((a, b)=>a - b);
        fill_scale.domain(d3.range(mapfill.length-1).map(d=>d3.quantile(domainArr, (d + 1) / mapfill.length)));

        let title = <text transform={'translate(' + this.props.width/2 + ',' + this.props.height/8 + ')'} style={{fontSize: '1.2em', fontWeight: 'bold', fill: '#000', className: 'title', textAnchor: 'middle'}}>{this.props.title}</text>;
        let map = layer.features.map((d,i)=><path key={'path' + i + '_boundary'} d = {path(d)} className='paths' style={{fill: this.props.layer_type!=='grid gross loss rates'? fill_scale(d.properties.value) : 'transparent', stroke: '#000', strokeWidth: 0.5}}/>);
        let labels = layer.features.map((d,i)=><g key={'path' + i + '_label'}>
                                                <rect x={d.properties.centroid[0]} y={d.properties.centroid[1]}
                                                width={label_width} height={label_height}
                                                rx={4}
                                                style={{fill: '#fff', stroke: this.props.layer_type!=='grid gross loss rates'? 'none' : '#000'}}/>
                                                <text
                                                x={d.properties.centroid[0]+label_width/2} y={d.properties.centroid[1]+label_height*0.8}
                                                style={{textAnchor: 'middle', fontSize: this.props.layer_type!=='grid gross loss rates'? '0.7em' : '1em', fontWeight: 'bold'}}>{d.properties.label}</text></g>);
        let background;
        if (this.props.layer_type==='grid gross loss rates') {
          background = this.props.background_layer.features.map((d,i)=><path key={'path' + i + '_background'} d = {path(d)} className='paths' style={{fill: 'transparent', stroke: 'rgb(221, 221, 221)'}}/>);
        }
        return ( 
            <svg width={this.props.width} height={this.props.height}>
                {title}{this.props.layer_type==='grid gross loss rates' && background}{map}{labels}
            </svg>
        );
    }
}

export default OtherLevelMap;