import chroma from 'chroma-js';
import Sample from './Sample';
export default class Palette {

  name: string;
  min: number;
  max: number;
  scale: string;
  colors: Array<string>;
  node: FrameNode;

  constructor(min, max, scale) {
    this.name = "Awesome Palette";
    this.min = min;
    this.max = max;
    this.scale = scale;
    this.colors = [];
    this.node = figma.createFrame();
  }

  makeNode() {
    this.node.layoutMode = "VERTICAL";
    this.node.primaryAxisSizingMode = "AUTO";
    this.node.counterAxisSizingMode = "AUTO";
    this.node.name = this.name;
    this.node.paddingTop = this.node.paddingRight = this.node.paddingBottom = this.node.paddingLeft = 32;
    this.node.cornerRadius = 16;
    this.node.setPluginData('min', this.min.toString());
    this.node.setPluginData('max', this.max.toString());
    this.node.setPluginData('scale', JSON.stringify(this.scale));

    figma.currentPage.selection.forEach(element => {

      let fills = element['fills'].filter(fill => fill.type === "SOLID");

      if (fills.length != 0) {

        fills.forEach(fill => {

          let rgb = fill.color;

          const item = figma.createFrame();
          item.layoutMode = "HORIZONTAL";
          item.counterAxisSizingMode = "AUTO";
          item.name = element.name;
          this.colors.push(rgb);

          Object.values(this.scale).forEach(lightness => {
            let newColor = chroma([rgb.r * 255, rgb.g * 255, rgb.b * 255]).set('lch.l', lightness);
            const sample = new Sample(`${element.name}-${Object.keys(this.scale).find(key => this.scale[key] === lightness).substr(10)}`, 128, 96, newColor._rgb).makeNode();
            item.name = element.name;
            item.appendChild(sample)
          });

          this.node.appendChild(item);

        })

      } else {
        figma.notify(`The layer "${element.name}" must get at least one solid color`);
      }

    });

    this.node.setPluginData('colors', JSON.stringify(this.colors));
    return this.node
  }

}
