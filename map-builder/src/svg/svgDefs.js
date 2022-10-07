import * as d3 from "d3";
import bg from '../assets/img/bg.png';
function appendGlow(selection, id="glows",
                    innerParams = {blur: 2, strength: 1, color: "#7c490e"},
                    outerParams = {blur: 4, strength: 1, color: '#998'}) {
    const colorInner = d3.rgb(innerParams.color);
    const colorOuter = d3.rgb(outerParams.color);
    const existing = d3.select(`#${id}`);
    // const defs = !existing.empty() ? existing.select(function() { return this.parentNode} ) : 
    //         .append('defs');
    if (!existing.empty()) existing.remove();
    let defs = selection.select('defs');
    if (defs.empty()) defs = selection.append('defs')
    const filter = defs.append('filter').attr('id', id).attr('filterUnits', 'userSpaceOnUse');

    // OUTER GLOW
    filter.append('feMorphology')
        .attr('in', 'SourceGraphic')
        .attr('radius', outerParams.strength)
        .attr('operator', 'dilate')
        .attr('result', 'MASK_OUTER');
    filter.append('feColorMatrix')
        .attr('in', 'MASK_OUTER')
        .attr('type', 'matrix')
        .attr('values', `0 0 0 0 ${colorOuter.r / 255} 0 0 0 0 ${colorOuter.g / 255} 0 0 0 0 ${colorOuter.b / 255} 0 0 0 ${colorOuter.opacity} 0`) // apply color
        .attr('result', 'OUTER_COLORED');
    filter.append('feGaussianBlur')
        .attr('in', 'OUTER_COLORED')
        .attr('stdDeviation', outerParams.blur)
        .attr('result', 'OUTER_BLUR');
    filter.append('feComposite')
        .attr('in', 'OUTER_BLUR')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'out')
        .attr('result', 'OUTGLOW');

    // INNER GLOW
    filter.append('feMorphology')
        .attr('in', 'SourceAlpha')
        .attr('radius', innerParams.strength)
        .attr('operator', 'erode')
        .attr('result', 'INNER_ERODED_A');
    filter.append('feComponentTransfer')
        .attr('in', 'INNER_ERODED_A')
        .attr('result', 'INNER_ERODED')
        .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', '1000')
            .attr('intercept', '0');

    filter.append('feGaussianBlur')
        .attr('in', 'INNER_ERODED')
        .attr('stdDeviation', innerParams.blur)
        .attr('result', 'INNER_BLURRED');

    filter.append('feColorMatrix')
        .attr('in', 'INNER_BLURRED')
        .attr('type', 'matrix')
        .attr('values', `0 0 0 0 ${colorInner.r / 255} 0 0 0 0 ${colorInner.g / 255} 0 0 0 0 ${colorInner.b / 255} 0 0 0 -1 ${colorInner.opacity }`) // inverse color
        .attr('result', 'INNER_COLOR');

    filter.append('feComposite')
        .attr('in', 'INNER_COLOR')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'in')
        .attr('result', 'INGLOW');

    // Merge
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'OUTGLOW');
    // merge.append('feMergeNode').attr('in', 'SourceGraphic');
    merge.append('feMergeNode').attr('in', 'INGLOW');
    filter.append(() => merge.node());

    defs.append(() => filter.node());
}

function appendBgPattern(selection, id, seaColor, backgroundNoise = false, imageSize = 300) {
    let defs = selection.select('defs');
    if (defs.empty()) defs = selection.append('defs')
    const existing = d3.select(`#${id}`);
    if (!existing.empty()) existing.remove();
    const pattern = defs.append('pattern')
        .attr('id', id)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', imageSize)
        .attr('height', imageSize);
        
    pattern.append('rect')
    .attr('width', imageSize).attr('height', imageSize)
    .attr('fill', seaColor);
    if (backgroundNoise) {
        pattern.append('image')
            .attr('href', bg)
            .attr('x', 0).attr('y', 0)
            .attr('width', imageSize).attr('height', imageSize);
    }
    defs.append(() => pattern.node());
}

export {appendGlow, appendBgPattern}; 