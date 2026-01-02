/**
 * function to output HTML table code from a javascript array, with options to format specific columns
 * @function
 * @param {string} my_array - the javascript array to be outputted as html.
 * @param {object} my_options - options: cols = object with list of columns and formats, e.g. {colA: 'p1', colB: 'd1'}
 * @returns {string}
 */
const array_to_html = function(my_array, my_options = {}) {
    if (my_array.length == 0) {
        throw new Error("Array is empty");
    }
    if ((typeof my_array[0]) != 'object') {
        throw new Error("Array elements are not objects");
        }
    let formats = {
      p1: {style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1},
      p2: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2},
      d1: {style: 'decimal', minimumFractionDigits: 1, maximumFractionDigits: 1},
      d2: {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2},
      p1s: {style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero"},
      p2s: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero"},
      d1s: {style: 'decimal', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero"},
      d2s: {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero"}
    };
    let cols = [];
    // create merge function
    const merge = (a, b, predicate = (a, b) => a === b) => {
        const c = [...a]; // copy to avoid side effects
        // add all items from B to copy C if they're not already present
        b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)));
        return c;
    };
    // see if there is a "cols" option
    if (my_options.cols) {
        cols = my_options.cols.keys();
    }
    // add any other columns found in rows
    my_array.forEach(my_row => {
        cols = merge (cols, Object.keys(my_row));
    });
    // build html
    let HTML ='<table><tr>';
    cols.forEach(my_col => {
        HTML += `<th>${my_col}</th>`;
        });
    HTML += '</tr>';
    my_array.forEach(my_row => {
        HTML += '<tr>';
        cols.forEach(my_col => {
            HTML += `<td>${my_options.cols.get(my_col)?Intl.NumberFormat('en-US',formats[my_options.cols.get(my_col)]).format(my_row[my_col]):my_row[my_col] || ''}</td>`;
        });
        HTML += '</tr>';
    });
    HTML += '</table>';
    return HTML;
};

export default array_to_html;
