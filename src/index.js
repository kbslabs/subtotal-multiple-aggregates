import flatten from "array-flatten";

let hasProp = {}.hasOwnProperty;
let callWithJQuery = function (pivotModule) {
  if (typeof exports === "object" && typeof module === "object") {
    // CommonJS
    return (module.exports = pivotModule);
  } else if (typeof define === "function" && define.amd) {
    // AMD
    return define(["jquery"], pivotModule);
  } else {
    // Plain browser env
    return pivotModule(jQuery);
  }
};

callWithJQuery(function ($) {
  var LOOKER_ROW_TOTAL_KEY,
    SubtotalPivotDataMulti,
    SubtotalRenderer,
    aggregatorTemplates,
    subtotalAggregatorTemplates,
    usFmtPct;
  LOOKER_ROW_TOTAL_KEY = "$$$_row_total_$$$";
  SubtotalPivotDataMulti = function () {
    var processKey;

    class SubtotalPivotDataMulti extends $.pivotUtilities.PivotData {
      constructor(input, opts) {
        var i, l, len, name, ref, ref1, ref2, ref3, ref4, ref5, ref6;
        super(input, opts);
        this.hasColTotals = (ref = opts.hasColTotals) != null ? ref : true;
        this.hasRowTotals = this.colAttrs.length
          ? (ref1 = opts.hasRowTotals) != null
            ? ref1
            : true
          : true;
        this.labels = (ref2 = opts.labels) != null ? ref2 : {};
        // Multiple aggregator hack: Let clients pass in aggregators
        // (plural) and use the first one as the main value for each cell.
        this.aggregatorNames =
          (ref3 = opts.aggregatorNames) != null ? ref3 : ["Count"];
        this.aggregators =
          (ref4 = opts.aggregators) != null
            ? ref4
            : function () {
                var l, len, ref5, results;
                ref5 = this.aggregatorNames;
                results = [];
                for (l = 0, len = ref5.length; l < len; l++) {
                  name = ref5[l];
                  results.push($.pivotUtilities.aggregators[name]({}));
                }
                return results;
              }.call(this);
        this.aggregatorName = this.aggregatorNames[0];
        this.aggregator = this.aggregators[0];
        if (this.aggregatorNames.length !== this.aggregators.length) {
          throw new Error(
            "aggregators and aggregatorNames must be the same length"
          );
        }
        this.allTotal = {};
        ref5 = this.aggregatorNames;
        for (i = l = 0, len = ref5.length; l < len; i = ++l) {
          name = ref5[i];
          this.allTotal[name] = this.aggregators[i](this, [], []);
        }
        SubtotalPivotDataMulti.forEachRecord(
          this.input,
          this.derivedAttributes,
          (record) => {
            if (this.filter(record)) {
              return this.processRecord(record);
            }
          }
        );
        this.hasLookerRowTotals = flatten(this.getColKeys()).includes(
          LOOKER_ROW_TOTAL_KEY
        );
        this.useLookerRowTotals =
          ((ref6 = opts.useLookerRowTotals) != null ? ref6 : true) &&
          this.hasLookerRowTotals;
      }

      processRecord(record) {
        //this code is called in a tight loop
        var addKey,
          aggregator,
          attr,
          base,
          base1,
          colKey,
          fColKey,
          fRowKey,
          flatColKey,
          flatKey,
          flatRowKey,
          i,
          j,
          k,
          l,
          len,
          len1,
          len2,
          len3,
          len4,
          len5,
          len6,
          len7,
          m,
          n,
          name,
          o,
          q,
          r,
          ref,
          ref1,
          ref10,
          ref11,
          ref2,
          ref3,
          ref4,
          ref5,
          ref6,
          ref7,
          ref8,
          ref9,
          rowKey,
          s,
          t,
          u,
          w,
          y,
          z;

        // Since this gets called in the PivotData (superclass) constructor
        // but we haven't yet initialized @aggregators, don't do anything.
        if (!this.aggregators) {
          return;
        }
        rowKey = [];
        addKey = false;
        ref = this.rowAttrs;
        for (l = 0, len = ref.length; l < len; l++) {
          attr = ref[l];
          rowKey.push((ref1 = record[attr]) != null ? ref1 : "null");
          flatKey = rowKey.join(String.fromCharCode(0));
          if (!this.rowTotals[flatKey]) {
            this.rowTotals[flatKey] = {};
            ref2 = this.aggregatorNames;
            for (i = o = 0, len1 = ref2.length; o < len1; i = ++o) {
              name = ref2[i];
              aggregator = this.aggregators[i];
              this.rowTotals[flatKey][name] = aggregator(
                this,
                rowKey.slice(),
                []
              );
              addKey = true;
            }
          }
          if (
            this.colAttrs.length &&
            record[this.colAttrs[0]] === LOOKER_ROW_TOTAL_KEY
          ) {
            // Don't aggregate alread-aggregated data.
            continue;
          }
          ref3 = this.aggregatorNames;
          for (q = 0, len2 = ref3.length; q < len2; q++) {
            name = ref3[q];
            this.rowTotals[flatKey][name].push(record);
          }
        }
        if (addKey) {
          this.rowKeys.push(rowKey);
        }
        colKey = [];
        addKey = false;
        ref4 = this.colAttrs;
        for (r = 0, len3 = ref4.length; r < len3; r++) {
          attr = ref4[r];
          colKey.push((ref5 = record[attr]) != null ? ref5 : "null");
          flatKey = colKey.join(String.fromCharCode(0));
          if (!this.colTotals[flatKey]) {
            this.colTotals[flatKey] = {};
            ref6 = this.aggregatorNames;
            for (i = s = 0, len4 = ref6.length; s < len4; i = ++s) {
              name = ref6[i];
              aggregator = this.aggregators[i];
              this.colTotals[flatKey][name] = aggregator(
                this,
                [],
                colKey.slice()
              );
              addKey = true;
            }
          }
          ref7 = this.aggregatorNames;
          for (t = 0, len5 = ref7.length; t < len5; t++) {
            name = ref7[t];
            this.colTotals[flatKey][name].push(record);
          }
        }
        if (addKey) {
          this.colKeys.push(colKey);
        }
        if (colKey[0] !== LOOKER_ROW_TOTAL_KEY) {
          ref8 = this.aggregatorNames;
          for (u = 0, len6 = ref8.length; u < len6; u++) {
            name = ref8[u];
            this.allTotal[name].push(record);
          }
        }
        m = rowKey.length - 1;
        n = colKey.length - 1;
        if (m < 0 || n < 0) {
          return;
        }
        for (
          i = w = 0, ref9 = m;
          0 <= ref9 ? w <= ref9 : w >= ref9;
          i = 0 <= ref9 ? ++w : --w
        ) {
          fRowKey = rowKey.slice(0, i + 1);
          flatRowKey = fRowKey.join(String.fromCharCode(0));
          if ((base = this.tree)[flatRowKey] == null) {
            base[flatRowKey] = {};
          }
          for (
            j = y = 0, ref10 = n;
            0 <= ref10 ? y <= ref10 : y >= ref10;
            j = 0 <= ref10 ? ++y : --y
          ) {
            fColKey = colKey.slice(0, j + 1);
            flatColKey = fColKey.join(String.fromCharCode(0));
            if ((base1 = this.tree[flatRowKey])[flatColKey] == null) {
              base1[flatColKey] = {};
            }
            ref11 = this.aggregatorNames;
            for (k = z = 0, len7 = ref11.length; z < len7; k = ++z) {
              name = ref11[k];
              aggregator = this.aggregators[k];
              if (!this.tree[flatRowKey][flatColKey][name]) {
                this.tree[flatRowKey][flatColKey][name] = aggregator(
                  this,
                  fRowKey,
                  fColKey
                );
              }
              this.tree[flatRowKey][flatColKey][name].push(record);
            }
          }
        }
      }
    }

    processKey = function (record, totals, keys, attrs, getAggregator) {
      var addKey, attr, flatKey, key, l, len, ref;
      key = [];
      addKey = false;
      for (l = 0, len = attrs.length; l < len; l++) {
        attr = attrs[l];
        key.push((ref = record[attr]) != null ? ref : "null");
        flatKey = key.join(String.fromCharCode(0));
        if (!totals[flatKey]) {
          totals[flatKey] = getAggregator(key.slice());
          addKey = true;
        }
        totals[flatKey].push(record);
      }
      if (addKey) {
        keys.push(key);
      }
      return key;
    };

    return SubtotalPivotDataMulti;
  }.call(this);
  $.pivotUtilities.SubtotalPivotDataMulti = SubtotalPivotDataMulti;
  SubtotalRenderer = function (pivotData, opts) {
    var childNumberToCollapse,
      addClass,
      adjustAxisHeader,
      aggregatorNames,
      aggregators,
      allTotal,
      arrowCollapsed,
      arrowExpanded,
      buildAxisHeader,
      buildColAxisHeaders,
      buildColHeader,
      buildColTotals,
      buildColTotalsHeader,
      buildGrandTotal,
      buildRowAxisHeaders,
      buildRowHeader,
      buildRowTotalsHeader,
      buildValues,
      classColCollapsed,
      classColExpanded,
      classColHide,
      classColShow,
      classCollapsed,
      classExpanded,
      classRowCollapsed,
      classRowExpanded,
      classRowHide,
      classRowShow,
      clickStatusCollapsed,
      clickStatusExpanded,
      colAttrs,
      colKeys,
      colTotals,
      collapseAxis,
      collapseAxisHeaders,
      collapseChildCol,
      collapseChildRow,
      collapseChildRows,
      collapseCol,
      collapseHiddenColSubtotal,
      collapseRow,
      collapseShowColSubtotal,
      collapseShowRowSubtotal,
      createElement,
      defaults,
      escapeHtml,
      expandAxis,
      expandChildCol,
      expandChildRow,
      expandCol,
      expandHideColSubtotal,
      expandHideRowSubtotal,
      expandRow,
      expandShowColSubtotal,
      expandShowRowSubtotal,
      getHeaderText,
      getTableEventHandlers,
      hasClass,
      hasColTotals,
      hasLookerRowTotals,
      hasRowTotals,
      hideChildCol,
      hideChildRow,
      labels,
      lastPivotHeader,
      main,
      parseLabel,
      processKeys,
      removeClass,
      replaceClass,
      rowAttrs,
      rowKeys,
      rowTotals,
      setAttributes,
      showChildCol,
      showChildRow,
      showSubtotalFromIndex,
      tree,
      useLookerRowTotals;
    defaults = {
      table: {
        clickCallback: null,
      },
      localeStrings: {
        totals: "Totals",
        subtotalOf: "Subtotal of",
      },
      arrowCollapsed: "\u25B6",
      arrowExpanded: "\u25E2",
      rowSubtotalDisplay: {
        displayOnTop: true,
        disableFrom: 99999,
        collapseAt: 99999,
        hideOnExpand: true,
        disableExpandCollapse: false,
      },
      colSubtotalDisplay: {
        displayOnTop: true,
        disableFrom: 0,
        collapseAt: 0,
        hideOnExpand: false,
        disableExpandCollapse: false,
      },
      showSubtotalFromIndex: 0,
    };
    opts = $.extend(true, {}, defaults, opts);
    if (opts.rowSubtotalDisplay.disableSubtotal) {
      opts.rowSubtotalDisplay.disableFrom = 0;
    }
    if (
      typeof opts.rowSubtotalDisplay.disableAfter !== "undefined" &&
      opts.rowSubtotalDisplay.disableAfter !== null
    ) {
      opts.rowSubtotalDisplay.disableFrom =
        opts.rowSubtotalDisplay.disableAfter + 1;
    }
    if (
      typeof opts.rowSubtotalDisplay.collapseAt !== "undefined" &&
      opts.collapseRowsAt !== null
    ) {
      opts.rowSubtotalDisplay.collapseAt = opts.collapseRowsAt;
    }
    if (opts.colSubtotalDisplay.disableSubtotal) {
      opts.colSubtotalDisplay.disableFrom = 0;
    }
    if (
      typeof opts.colSubtotalDisplay.disableAfter !== "undefined" &&
      opts.colSubtotalDisplay.disableAfter !== null
    ) {
      opts.colSubtotalDisplay.disableFrom =
        opts.colSubtotalDisplay.disableAfter + 1;
    }
    if (
      typeof opts.colSubtotalDisplay.collapseAt !== "undefined" &&
      opts.collapseColsAt !== null
    ) {
      opts.colSubtotalDisplay.collapseAt = opts.collapseColsAt;
    }
    if (opts.colSubtotalDisplay.disableFrom > 0) {
      throw new Error("Column subtotals are unimplemented");
    }
    colAttrs = pivotData.colAttrs;
    rowAttrs = pivotData.rowAttrs;
    rowKeys = pivotData.getRowKeys();
    colKeys = pivotData.getColKeys();
    tree = pivotData.tree;
    rowTotals = pivotData.rowTotals;
    colTotals = pivotData.colTotals;
    allTotal = pivotData.allTotal;
    aggregators = pivotData.aggregators;
    aggregatorNames = pivotData.aggregatorNames;
    hasColTotals = pivotData.hasColTotals;
    hasRowTotals = pivotData.hasRowTotals;
    labels = pivotData.labels;
    hasLookerRowTotals = pivotData.hasLookerRowTotals;
    useLookerRowTotals = pivotData.useLookerRowTotals;
    classRowHide = "rowhide";
    classRowShow = "rowshow";
    classColHide = "colhide";
    classColShow = "colshow";
    clickStatusExpanded = "expanded";
    clickStatusCollapsed = "collapsed";
    classExpanded = "expanded";
    classCollapsed = "collapsed";
    classRowExpanded = "rowexpanded";
    classRowCollapsed = "rowcollapsed";
    classColExpanded = "colexpanded";
    classColCollapsed = "colcollapsed";
    arrowExpanded = opts.arrowExpanded;
    arrowCollapsed = opts.arrowCollapsed;
    childNumberToCollapse = 1;
    showSubtotalFromIndex = opts.showSubtotalFromIndex; //when rowSubtotalDisplay.hideOnExpand is true, this force subtotal row show usign columns indexes.
    // Based on http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript -- Begin
    hasClass = function (element, className) {
      var regExp;
      regExp = new RegExp("(?:^|\\s)" + className + "(?!\\S)", "g");
      return element.className.match(regExp) !== null;
    };
    removeClass = function (element, className) {
      var l, len, name, ref, regExp, results;
      ref = className.split(" ");
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        name = ref[l];
        regExp = new RegExp("(?:^|\\s)" + name + "(?!\\S)", "g");
        results.push(
          (element.className = element.className.replace(regExp, ""))
        );
      }
      return results;
    };
    addClass = function (element, className) {
      var l, len, name, ref, results;
      ref = className.split(" ");
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        name = ref[l];
        if (!hasClass(element, name)) {
          results.push((element.className += " " + name));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    replaceClass = function (element, replaceClassName, byClassName) {
      removeClass(element, replaceClassName);
      return addClass(element, byClassName);
    };
    // Based on http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript -- End
    escapeHtml = function (unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    parseLabel = function (parts) {
      var append, out;
      // Safe way to insert stylized labels. Parts can be a string or object { label, subabel }, or array as such.
      out = "";
      append = function (value) {
        var l, len, results, x;
        if (Array.isArray(value)) {
          results = [];
          for (l = 0, len = value.length; l < len; l++) {
            x = value[l];
            results.push(append(x));
          }
          return results;
        } else if (value != null ? value.label : void 0) {
          out += escapeHtml(value.label);
          if (value.sublabel) {
            return (out += ` <em>${escapeHtml(value.sublabel)}</em>`);
          }
        } else if (value !== null && value !== void 0) {
          return (out += escapeHtml(String(value)));
        }
      };
      append(parts);
      return out;
    };
    createElement = function (
      elementType,
      className,
      label,
      attributes,
      eventHandlers
    ) {
      var attr, e, event, handler, val;
      e = document.createElement(elementType);
      if (className != null) {
        e.className = className;
      }
      e.innerHTML = parseLabel(label);
      if (attributes != null) {
        for (attr in attributes) {
          if (!hasProp.call(attributes, attr)) continue;
          val = attributes[attr];
          e.setAttribute(attr, val);
        }
      }
      if (eventHandlers != null) {
        for (event in eventHandlers) {
          if (!hasProp.call(eventHandlers, event)) continue;
          handler = eventHandlers[event];
          e.addEventListener(event, handler);
        }
      }
      return e;
    };
    setAttributes = function (e, attrs) {
      var a, results, v;
      results = [];
      for (a in attrs) {
        if (!hasProp.call(attrs, a)) continue;
        v = attrs[a];
        results.push(e.setAttribute(a, v));
      }
      return results;
    };
    processKeys = function (keysArr, className, opts) {
      var headers, lastIdx, row;
      lastIdx = keysArr[0].length - 1;
      headers = {
        children: [],
      };
      row = 0;
      keysArr.reduce((val0, k0) => {
        var col;
        col = 0;
        k0.reduce((acc, curVal, curIdx, arr) => {
          var i, key, l, node, ref;
          if (!acc[curVal]) {
            key = k0.slice(0, col + 1);
            acc[curVal] = {
              row: row,
              col: col,
              descendants: 0,
              children: [],
              text: curVal,
              key: key,
              flatKey: key.join(String.fromCharCode(0)),
              firstLeaf: null,
              leaves: 0,
              parent: col !== 0 ? acc : null,
              th: createElement("th", className, curVal),
              childrenSpan: 0,
            };
            acc.children.push(curVal);
          }
          if (col > 0) {
            acc.descendants++;
          }
          col++;
          if (curIdx === lastIdx) {
            node = headers;
            for (
              i = l = 0, ref = lastIdx - 1;
              0 <= ref ? l <= ref : l >= ref;
              i = 0 <= ref ? ++l : --l
            ) {
              if (!(lastIdx > 0)) {
                continue;
              }
              node[k0[i]].leaves++;
              if (!node[k0[i]].firstLeaf) {
                node[k0[i]].firstLeaf = acc[curVal];
              }
              node = node[k0[i]];
            }
            return headers;
          }
          return acc[curVal];
        }, headers);
        row++;
        return headers;
      }, headers);
      return headers;
    };
    buildAxisHeader = function (axisHeaders, col, attrs, opts) {
      var ah, arrow, hClass, ref;
      ah = {
        text: (ref = labels[attrs[col]]) != null ? ref : attrs[col],
        expandedCount: 0,
        expandables: 0,
        attrHeaders: [],
        clickStatus: clickStatusExpanded,
        onClick: collapseAxis,
      };
      arrow = `${arrowExpanded} `;
      hClass = classExpanded;
      if (col >= opts.collapseAt) {
        arrow = `${arrowCollapsed} `;
        hClass = classCollapsed;
        ah.clickStatus = clickStatusCollapsed;
        ah.onClick = expandAxis;
      }
      if (
        col === attrs.length - 1 ||
        col >= opts.disableFrom ||
        opts.disableExpandCollapse
      ) {
        arrow = "";
      }
      ah.th = createElement("th", `pvtAxisLabel ${hClass}`, [arrow, ah.text]);
      if (
        col < attrs.length - 1 &&
        col < opts.disableFrom &&
        !opts.disableExpandCollapse
      ) {
        ah.th.onclick = function (event) {
          event = event || window.event;
          return ah.onClick(axisHeaders, col, attrs, opts);
        };
      }
      axisHeaders.ah.push(ah);
      return ah;
    };
    buildColAxisHeaders = function (thead, rowAttrs, colAttrs, opts) {
      var ah, attr, axisHeaders, col, l, len;
      axisHeaders = {
        collapseAttrHeader: collapseCol,
        expandAttrHeader: expandCol,
        ah: [],
      };
      for (col = l = 0, len = colAttrs.length; l < len; col = ++l) {
        attr = colAttrs[col];
        ah = buildAxisHeader(
          axisHeaders,
          col,
          colAttrs,
          opts.colSubtotalDisplay
        );
        ah.th.colSpan = rowAttrs.length;
        ah.tr = createElement("tr", "pvtColAxisHeaders");
        ah.tr.appendChild(ah.th);
        thead.appendChild(ah.tr);
      }
      return axisHeaders;
    };
    buildRowAxisHeaders = function (thead, rowAttrs, colAttrs, opts) {
      var ah, axisHeaders, col, l, ref;
      axisHeaders = {
        collapseAttrHeader: collapseRow,
        expandAttrHeader: expandRow,
        ah: [],
        tr: createElement("tr", "pvtRowAxisHeaders"),
      };
      for (
        col = l = 0, ref = rowAttrs.length - 1;
        0 <= ref ? l <= ref : l >= ref;
        col = 0 <= ref ? ++l : --l
      ) {
        ah = buildAxisHeader(
          axisHeaders,
          col,
          rowAttrs,
          opts.rowSubtotalDisplay
        );
        axisHeaders.tr.appendChild(ah.th);
      }
      thead.appendChild(axisHeaders.tr);
      return axisHeaders;
    };
    getHeaderText = function (h, attrs, opts) {
      var arrow, label;
      arrow = ` ${arrowExpanded} `;
      if (
        h.col === attrs.length - 1 ||
        h.col >= opts.disableFrom ||
        opts.disableExpandCollapse ||
        h.children.length === 0
      ) {
        arrow = "";
      }
      label = h.text === LOOKER_ROW_TOTAL_KEY ? "Total" : h.text;
      return `${arrow}${label}`;
    };
    buildColHeader = function (
      axisHeaders,
      attrHeaders,
      h,
      rowAttrs,
      colAttrs,
      node,
      opts
    ) {
      var ah, chKey, l, len, ref, ref1;
      ref = h.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        // DF Recurse
        buildColHeader(
          axisHeaders,
          attrHeaders,
          h[chKey],
          rowAttrs,
          colAttrs,
          node,
          opts
        );
      }
      // Process
      ah = axisHeaders.ah[h.col];
      ah.attrHeaders.push(h);
      h.node = node.counter;
      h.onClick = collapseCol;
      addClass(
        h.th,
        `${classColShow} col${h.row} colcol${h.col} ${classColExpanded}`
      );
      h.th.setAttribute("data-colnode", h.node);
      h.th.colSpan = h.children.length
        ? h.childrenSpan
        : aggregatorNames.length;
      //h.th.rowSpan = 2 if h.children.length is 0 and rowAttrs.length isnt 0
      h.th.innerHTML = getHeaderText(h, colAttrs, opts.colSubtotalDisplay);
      if (
        h.children.length !== 0 &&
        h.col < opts.colSubtotalDisplay.disableFrom
      ) {
        ah.expandables++;
        ah.expandedCount += 1;
        if (!opts.colSubtotalDisplay.hideOnExpand) {
          h.th.colSpan++;
        }
        if (!opts.colSubtotalDisplay.disableExpandCollapse) {
          h.th.onclick = function (event) {
            event = event || window.event;
            return h.onClick(axisHeaders, h, opts.colSubtotalDisplay);
          };
        }
        h.sTh = createElement(
          "th",
          `pvtColLabelFiller ${classColShow} col${h.row} colcol${h.col} ${classColExpanded}`
        );
        h.sTh.setAttribute("data-colnode", h.node);
        if (opts.colSubtotalDisplay.hideOnExpand) {
          // h.sTh.rowSpan = colAttrs.length-h.col
          replaceClass(h.sTh, classColShow, classColHide);
        }
        h[h.children[0]].tr.appendChild(h.sTh);
      }
      if ((ref1 = h.parent) != null) {
        ref1.childrenSpan += h.th.colSpan;
      }
      h.clickStatus = clickStatusExpanded;
      if (h.text === LOOKER_ROW_TOTAL_KEY) {
        if (!h.children.length) {
          //h.th.rowSpan = colAttrs.length
          addClass(h.th, "pvtColTotal");
          ah.tr.appendChild(h.th);
          h.tr = ah.tr;
        } else {
          ah.tr.appendChild(
            createElement("th", null, null, {
              colspan: aggregatorNames.length,
            })
          );
        }
      } else {
        ah.tr.appendChild(h.th);
        h.tr = ah.tr;
      }
      attrHeaders.push(h);
      return node.counter++;
    };
    buildRowTotalsHeader = function (tr, colKeyHeaders, rowAttrs, colAttrs) {
      var addHeaders, child, l, len, len1, len2, len3, name, o, q, r, ref, th;
      if (colAttrs.length > 0) {
        // We have pivots.
        if (colKeyHeaders) {
          addHeaders = function (headers) {
            var child, l, len, len1, name, o, ref, results, results1, th;
            if (headers.children.length > 0) {
              ref = headers.children;
              results = [];
              for (l = 0, len = ref.length; l < len; l++) {
                child = ref[l];
                if (child === LOOKER_ROW_TOTAL_KEY) {
                  continue;
                }
                results.push(addHeaders(headers[child]));
              }
              return results;
            } else {
              results1 = [];
              for (o = 0, len1 = aggregatorNames.length; o < len1; o++) {
                name = aggregatorNames[o];
                th = createElement("th", "rowTotal", labels[name]);
                results1.push(tr.appendChild(th));
              }
              return results1;
            }
          };
          addHeaders(colKeyHeaders);
          if (useLookerRowTotals) {
            ref = colKeyHeaders.children;
            for (l = 0, len = ref.length; l < len; l++) {
              child = ref[l];
              if (child === LOOKER_ROW_TOTAL_KEY) {
                continue;
              }
              for (o = 0, len1 = aggregatorNames.length; o < len1; o++) {
                name = aggregatorNames[o];
                th = createElement("th", "rowTotal", labels[name]);
                tr.appendChild(th);
              }
            }
          }
          if (hasRowTotals && !useLookerRowTotals) {
            for (q = 0, len2 = aggregatorNames.length; q < len2; q++) {
              name = aggregatorNames[q];
              th = createElement("th", "rowTotal", labels[name]);
              tr.appendChild(th);
            }
          }
        } else {
          th = createElement("th", "pvtColLabel pvtColTotal", "Total*", {
            colspan: aggregatorNames.length,
          });
          tr.appendChild(th);
        }
      } else {
        // No pivots, but we still need to add column headers.
        for (r = 0, len3 = aggregatorNames.length; r < len3; r++) {
          name = aggregatorNames[r];
          th = createElement("th", "rowTotal", labels[name]);
          tr.appendChild(th);
        }
      }
    };
    lastPivotHeader = null;
    buildRowHeader = function (
      tbody,
      axisHeaders,
      attrHeaders,
      h,
      rowAttrs,
      colAttrs,
      node,
      opts
    ) {
      var ah, chKey, firstChild, i, l, len, o, ref, ref1, ref2;
      ref = h.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        // DF Recurse
        buildRowHeader(
          tbody,
          axisHeaders,
          attrHeaders,
          h[chKey],
          rowAttrs,
          colAttrs,
          node,
          opts
        );
      }
      // Process
      ah = axisHeaders.ah[h.col];
      ah.attrHeaders.push(h);
      h.node = node.counter;
      h.onClick = collapseRow;
      if (h.children.length !== 0) {
        firstChild = h[h.children[0]];
      }
      if (lastPivotHeader) {
        removeClass(lastPivotHeader, "lastPivot");
      }
      lastPivotHeader = h.th;
      addClass(
        h.th,
        `${classRowShow} pvtRowHeader lastPivot row${h.row} rowcol${h.col} ${classRowExpanded}`
      );
      h.th.setAttribute("data-rownode", h.node);
      if (h.children.length !== 0) {
        // h.th.colSpan = 2 if h.col is rowAttrs.length-1 and colAttrs.length isnt 0
        h.th.rowSpan = h.childrenSpan;
      }
      h.th.innerHTML = getHeaderText(h, rowAttrs, opts.rowSubtotalDisplay);
      h.tr = createElement("tr", `row${h.row}`);
      h.tr.appendChild(h.th);
      if (h.children.length === 0) {
        tbody.appendChild(h.tr);
      } else {
        tbody.insertBefore(h.tr, firstChild.tr);
      }
      if (
        h.children.length !== 0 &&
        h.col < opts.rowSubtotalDisplay.disableFrom
      ) {
        ++ah.expandedCount;
        ++ah.expandables;
        if (!opts.rowSubtotalDisplay.disableExpandCollapse) {
          h.th.onclick = function (event) {
            event = event || window.event;
            return h.onClick(axisHeaders, h, opts.rowSubtotalDisplay);
          };
        }
        for (
          i = o = 0, ref1 = rowAttrs.length - h.col - 1;
          0 <= ref1 ? o < ref1 : o > ref1;
          i = 0 <= ref1 ? ++o : --o
        ) {
          h.sTh = createElement(
            "th",
            `pvtRowLabelFiller row${h.row} rowcol${h.col} ${classRowExpanded} ${classRowShow}`
          );
          if (
            opts.rowSubtotalDisplay.hideOnExpand &&
            h.col > showSubtotalFromIndex
          ) {
            replaceClass(h.sTh, classRowShow, classRowHide);
          }
          h.sTh.setAttribute("data-rownode", h.node);
          //h.sTh.colSpan = rowAttrs.length-h.col-1
          if (opts.rowSubtotalDisplay.displayOnTop) {
            h.tr.appendChild(h.sTh);
          } else {
            h.th.rowSpan += 1; // if not opts.rowSubtotalDisplay.hideOnExpand
            h.sTr = createElement("tr", `row${h.row}`);
            h.sTr.appendChild(h.sTh);
            tbody.appendChild(h.sTr);
          }
        }
      }
      if (h.children.length !== 0) {
        h.th.rowSpan++;
      }
      if ((ref2 = h.parent) != null) {
        ref2.childrenSpan += h.th.rowSpan;
      }
      h.clickStatus = clickStatusExpanded;
      attrHeaders.push(h);
      return node.counter++;
    };
    getTableEventHandlers = function (
      value,
      rowKey,
      colKey,
      rowAttrs,
      colAttrs,
      opts
    ) {
      var attr, event, eventHandlers, filters, handler, i, ref, ref1;
      if (!((ref = opts.table) != null ? ref.eventHandlers : void 0)) {
        return;
      }
      eventHandlers = {};
      ref1 = opts.table.eventHandlers;
      for (event in ref1) {
        if (!hasProp.call(ref1, event)) continue;
        handler = ref1[event];
        filters = {};
        for (i in colAttrs) {
          if (!hasProp.call(colAttrs, i)) continue;
          attr = colAttrs[i];
          if (colKey[i] != null) {
            filters[attr] = colKey[i];
          }
        }
        for (i in rowAttrs) {
          if (!hasProp.call(rowAttrs, i)) continue;
          attr = rowAttrs[i];
          if (rowKey[i] != null) {
            filters[attr] = rowKey[i];
          }
        }
        eventHandlers[event] = function (e) {
          return handler(e, value, filters, pivotData);
        };
      }
      return eventHandlers;
    };
    buildValues = function (
      tbody,
      colAttrHeaders,
      rowAttrHeaders,
      rowAttrs,
      colAttrs,
      opts
    ) {
      var aggregator,
        ch,
        cls,
        l,
        len,
        len1,
        len2,
        len3,
        name,
        o,
        q,
        r,
        rCls,
        ref,
        rh,
        td,
        totalAggregator,
        tr,
        val;
      for (l = 0, len = rowAttrHeaders.length; l < len; l++) {
        rh = rowAttrHeaders[l];
        if (
          !(
            rh.col === rowAttrs.length - 1 ||
            (rh.children.length !== 0 &&
              rh.col < opts.rowSubtotalDisplay.disableFrom)
          )
        ) {
          continue;
        }
        rCls = `pvtVal row${rh.row} rowcol${rh.col} ${classRowExpanded}`;
        if (rh.children.length > 0) {
          rCls += " pvtRowSubtotal";
          rCls +=
            opts.rowSubtotalDisplay.hideOnExpand &&
            rh.col > showSubtotalFromIndex
              ? ` ${classRowHide}`
              : `  ${classRowShow}`;
        } else {
          rCls += ` ${classRowShow}`;
        }
        tr = rh.sTr ? rh.sTr : rh.tr;
        for (o = 0, len1 = colAttrHeaders.length; o < len1; o++) {
          ch = colAttrHeaders[o];
          if (
            ch.col === colAttrs.length - 1 ||
            (ch.children.length !== 0 &&
              ch.col < opts.colSubtotalDisplay.disableFrom)
          ) {
            for (q = 0, len2 = aggregatorNames.length; q < len2; q++) {
              name = aggregatorNames[q];
              let reference =
                tree[rh.flatKey][ch.flatKey] &&
                tree[rh.flatKey][ch.flatKey][name];
              aggregator = reference
                ? reference
                : {
                    value: function () {
                      return null;
                    },
                    format: function () {
                      return "";
                    },
                  };
              val = aggregator.value();
              cls = ` ${rCls} col${ch.row} colcol${ch.col} ${classColExpanded}`;
              if (ch.children.length > 0) {
                cls += " pvtColSubtotal";
                cls += opts.colSubtotalDisplay.hideOnExpand
                  ? ` ${classColHide}`
                  : ` ${classColShow}`;
              } else {
                cls += ` ${classColShow}`;
              }
              td = createElement(
                "td",
                cls,
                aggregator.format(val),
                {
                  "data-value": val,
                  "data-rownode": rh.node,
                  "data-colnode": ch.node,
                },
                getTableEventHandlers(
                  val,
                  rh.key,
                  ch.key,
                  rowAttrs,
                  colAttrs,
                  opts
                )
              );
              tr.appendChild(td);
            }
          }
        }
        // buildRowTotal
        if (hasRowTotals && !useLookerRowTotals) {
          for (r = 0, len3 = aggregatorNames.length; r < len3; r++) {
            name = aggregatorNames[r];
            totalAggregator = rowTotals[rh.flatKey][name];
            val = totalAggregator.value();
            td = createElement(
              "td",
              `pvtTotal rowTotal ${rCls}`,
              totalAggregator.format(val),
              {
                "data-value": val,
                "data-row": `row${rh.row}`,
                "data-rowcol": `col${rh.col}`,
                "data-rownode": rh.node,
              }
            );
            getTableEventHandlers(val, rh.key, [], rowAttrs, colAttrs, opts);
            tr.appendChild(td);
          }
        }
      }
    };
    buildColTotalsHeader = function (rowAttrs, colAttrs) {
      var colspan, th, tr;
      tr = createElement("tr", "pvtRowTotal");
      colspan = rowAttrs.length;
      th = createElement(
        "th",
        "pvtTotalLabel colTotal",
        opts.localeStrings.totals,
        {
          colspan: colspan,
        }
      );
      tr.appendChild(th);
      return tr;
    };
    buildColTotals = function (tr, attrHeaders, rowAttrs, colAttrs, opts) {
      var clsNames, h, i, l, len, len1, name, o, td, totalAggregator, val;
      for (l = 0, len = attrHeaders.length; l < len; l++) {
        h = attrHeaders[l];
        if (
          !(
            h.col === colAttrs.length - 1 ||
            (h.children.length !== 0 &&
              h.col < opts.colSubtotalDisplay.disableFrom)
          )
        ) {
          continue;
        }
        clsNames = `pvtVal pvtTotal colTotal ${classColExpanded} col${h.row} colcol${h.col}`;
        if (h.children.length !== 0) {
          clsNames += " pvtColSubtotal";
          clsNames += opts.colSubtotalDisplay.hideOnExpand
            ? ` ${classColHide}`
            : ` ${classColShow}`;
        } else {
          clsNames += ` ${classColShow}`;
        }
        for (i = o = 0, len1 = aggregatorNames.length; o < len1; i = ++o) {
          name = aggregatorNames[i];
          totalAggregator = colTotals[h.flatKey][aggregatorNames[i]];
          val = totalAggregator.value();
          td = createElement(
            "td",
            clsNames,
            totalAggregator.format(val),
            {
              "data-value": val,
              "data-for": `col${h.col}`,
              "data-colnode": `${h.node}`,
            },
            getTableEventHandlers(val, [], h.key, rowAttrs, colAttrs, opts)
          );
          tr.appendChild(td);
        }
      }
    };
    buildGrandTotal = function (tbody, tr, rowAttrs, colAttrs, opts) {
      var l, len, name, results, td, totalAggregator, val;
      results = [];
      for (l = 0, len = aggregatorNames.length; l < len; l++) {
        name = aggregatorNames[l];
        totalAggregator = allTotal[name];
        val = totalAggregator.value();
        td = createElement(
          "td",
          "pvtGrandTotal",
          totalAggregator.format(val),
          {
            "data-value": val,
          },
          getTableEventHandlers(val, [], [], rowAttrs, colAttrs, opts)
        );
        results.push(tr.appendChild(td));
      }
      return results;
    };
    collapseAxisHeaders = function (axisHeaders, col, opts) {
      var ah, collapsible, i, l, ref, ref1, results;
      collapsible = Math.min(axisHeaders.ah.length - 2, opts.disableFrom - 1);
      if (col > collapsible) {
        return;
      }
      results = [];
      for (
        i = l = ref = col, ref1 = collapsible;
        ref <= ref1 ? l <= ref1 : l >= ref1;
        i = ref <= ref1 ? ++l : --l
      ) {
        ah = axisHeaders.ah[i];
        replaceClass(ah.th, classExpanded, classCollapsed);
        ah.th.innerHTML = parseLabel([` ${arrowCollapsed} `, ah.text]);
        ah.clickStatus = clickStatusCollapsed;
        results.push((ah.onClick = expandAxis));
      }
      return results;
    };
    adjustAxisHeader = function (axisHeaders, col, opts) {
      var ah;
      ah = axisHeaders.ah[col];
      if (ah.expandedCount === 0) {
        return collapseAxisHeaders(axisHeaders, col, opts);
      } else if (ah.expandedCount === ah.expandables) {
        replaceClass(ah.th, classCollapsed, classExpanded);
        ah.th.innerHTML = parseLabel([` ${arrowExpanded} `, ah.text]);
        ah.clickStatus = clickStatusExpanded;
        return (ah.onClick = collapseAxis);
      }
    };
    hideChildCol = function (ch) {
      return $(ch.th)
        .closest("table.pvtTable")
        .find(
          `tbody tr td[data-colnode=\"${ch.node}\"], th[data-colnode=\"${ch.node}\"]`
        )
        .removeClass(classColShow)
        .addClass(classColHide);
    };
    collapseHiddenColSubtotal = function (h, opts) {
      $(h.th)
        .closest("table.pvtTable")
        .find(
          `tbody tr td[data-colnode=\"${h.node}\"], th[data-colnode=\"${h.node}\"]`
        )
        .removeClass(classColExpanded)
        .addClass(classColCollapsed);
      if (h.children.length !== 0) {
        h.th.innerHTML = ` ${arrowCollapsed} ${h.text}`;
      }
      return (h.th.colSpan = 1);
    };
    collapseShowColSubtotal = function (h, opts) {
      $(h.th)
        .closest("table.pvtTable")
        .find(
          `tbody tr td[data-colnode=\"${h.node}\"], th[data-colnode=\"${h.node}\"]`
        )
        .removeClass(classColExpanded)
        .addClass(classColCollapsed)
        .removeClass(classColHide)
        .addClass(classColShow);
      if (h.children.length !== 0) {
        h.th.innerHTML = ` ${arrowCollapsed} ${h.text}`;
      }
      return (h.th.colSpan = 1);
    };
    collapseChildCol = function (ch, h) {
      var chKey, l, len, ref;
      ref = ch.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        if (hasClass(ch[chKey].th, classColShow)) {
          collapseChildCol(ch[chKey], h);
        }
      }
      return hideChildCol(ch);
    };
    collapseCol = function (axisHeaders, h, opts) {
      var chKey, colSpan, l, len, p, ref;
      colSpan = h.th.colSpan - 1;
      ref = h.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        if (hasClass(h[chKey].th, classColShow)) {
          collapseChildCol(h[chKey], h);
        }
      }
      if (h.col < opts.disableFrom) {
        if (hasClass(h.th, classColHide)) {
          collapseHiddenColSubtotal(h, opts);
        } else {
          collapseShowColSubtotal(h, opts);
        }
      }
      p = h.parent;
      while (p) {
        p.th.colSpan -= colSpan;
        p = p.parent;
      }
      h.clickStatus = clickStatusCollapsed;
      h.onClick = expandCol;
      axisHeaders.ah[h.col].expandedCount--;
      return adjustAxisHeader(axisHeaders, h.col, opts);
    };
    showChildCol = function (ch) {
      return $(ch.th)
        .closest("table.pvtTable")
        .find(
          `tbody tr td[data-colnode=\"${ch.node}\"], th[data-colnode=\"${ch.node}\"]`
        )
        .removeClass(classColHide)
        .addClass(classColShow);
    };
    expandHideColSubtotal = function (h) {
      $(h.th)
        .closest("table.pvtTable")
        .find(
          `tbody tr td[data-colnode=\"${h.node}\"], th[data-colnode=\"${h.node}\"]`
        )
        .removeClass(`${classColCollapsed} ${classColShow}`)
        .addClass(`${classColExpanded} ${classColHide}`);
      replaceClass(h.th, classColHide, classColShow);
      return (h.th.innerHTML = ` ${arrowExpanded} ${h.text}`);
    };
    expandShowColSubtotal = function (h) {
      $(h.th)
        .closest("table.pvtTable")
        .find(
          `tbody tr td[data-colnode=\"${h.node}\"], th[data-colnode=\"${h.node}\"]`
        )
        .removeClass(`${classColCollapsed} ${classColHide}`)
        .addClass(`${classColExpanded} ${classColShow}`);
      h.th.colSpan++;
      return (h.th.innerHTML = ` ${arrowExpanded} ${h.text}`);
    };
    expandChildCol = function (ch, opts) {
      var chKey, l, len, ref, results;
      if (
        ch.children.length !== 0 &&
        opts.hideOnExpand &&
        ch.clickStatus === clickStatusExpanded
      ) {
        replaceClass(ch.th, classColHide, classColShow);
      } else {
        showChildCol(ch);
      }
      if (
        ch.sTh &&
        ch.clickStatus === clickStatusExpanded &&
        opts.hideOnExpand
      ) {
        replaceClass(ch.sTh, classColShow, classColHide);
      }
      if (
        ch.clickStatus === clickStatusExpanded ||
        ch.col >= opts.disableFrom
      ) {
        ref = ch.children;
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          chKey = ref[l];
          results.push(expandChildCol(ch[chKey], opts));
        }
        return results;
      }
    };
    expandCol = function (axisHeaders, h, opts) {
      var ch, chKey, colSpan, l, len, p, ref;
      if (h.clickStatus === clickStatusExpanded) {
        adjustAxisHeader(axisHeaders, h.col, opts);
        return;
      }
      colSpan = 0;
      ref = h.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        ch = h[chKey];
        expandChildCol(ch, opts);
        colSpan += ch.th.colSpan;
      }
      h.th.colSpan = colSpan;
      if (h.col < opts.disableFrom) {
        if (opts.hideOnExpand && h.col > showSubtotalFromIndex) {
          expandHideColSubtotal(h);
          --colSpan;
        } else {
          expandShowColSubtotal(h);
        }
      }
      p = h.parent;
      while (p) {
        p.th.colSpan += colSpan;
        p = p.parent;
      }
      h.clickStatus = clickStatusExpanded;
      h.onClick = collapseCol;
      axisHeaders.ah[h.col].expandedCount++;
      return adjustAxisHeader(axisHeaders, h.col, opts);
    };
    hideChildRow = function (ch, opts) {
      var cell, l, len, len1, o, ref, ref1, results;
      ref = ch.tr.querySelectorAll("th, td");
      for (l = 0, len = ref.length; l < len; l++) {
        cell = ref[l];
        replaceClass(cell, classRowShow, classRowHide);
      }
      if (ch.sTr) {
        ref1 = ch.sTr.querySelectorAll("th, td");
        results = [];
        for (o = 0, len1 = ref1.length; o < len1; o++) {
          cell = ref1[o];
          results.push(replaceClass(cell, classRowShow, classRowHide));
        }
        return results;
      }
    };
    collapseShowRowSubtotal = function (h, opts) {
      var cell, l, len, len1, o, ref, ref1, results;
      if (childNumberToCollapse && h.descendants === childNumberToCollapse) {
        h.th.innerHTML = ` ${h.text}`;
      } else {
        h.th.innerHTML = ` ${arrowCollapsed} ${h.text}`;
      }
      ref = h.tr.querySelectorAll("th, td");
      for (l = 0, len = ref.length; l < len; l++) {
        cell = ref[l];
        removeClass(cell, `${classRowExpanded} ${classRowHide}`);
        addClass(cell, `${classRowCollapsed} ${classRowShow}`);
      }
      if (h.sTr) {
        ref1 = h.sTr.querySelectorAll("th, td");
        results = [];
        for (o = 0, len1 = ref1.length; o < len1; o++) {
          cell = ref1[o];
          removeClass(cell, `${classRowExpanded} ${classRowHide}`);
          results.push(addClass(cell, `${classRowCollapsed} ${classRowShow}`));
        }
        return results;
      }
    };
    collapseChildRow = function (ch, h, opts) {
      var chKey, l, len, ref;
      ref = ch.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        collapseChildRow(ch[chKey], h, opts);
      }
      if (childNumberToCollapse && childNumberToCollapse === h.descendants) {
        if (ch.parent === h) {
          let newCell = ch.parent.tr.cells[1];
          newCell.innerHTML = ch.text;
        } else {
          let newCell = h.tr.cells[ch.col - h.col];
          newCell.innerHTML = ch.text;
        }
      }
      return hideChildRow(ch, opts);
    };
    collapseRow = function (axisHeaders, h, opts) {
      var chKey, l, len, ref;
      ref = h.children;
      for (l = 0, len = ref.length; l < len; l++) {
        chKey = ref[l];
        collapseChildRow(h[chKey], h, opts);
      }
      collapseShowRowSubtotal(h, opts);
      h.clickStatus = clickStatusCollapsed;
      h.onClick = expandRow;
      axisHeaders.ah[h.col].expandedCount--;
      return adjustAxisHeader(axisHeaders, h.col, opts);
    };
    showChildRow = function (ch, opts) {
      var cell, l, len, len1, o, ref, ref1, results;
      ref = ch.tr.querySelectorAll("th, td");
      for (l = 0, len = ref.length; l < len; l++) {
        cell = ref[l];
        replaceClass(cell, classRowHide, classRowShow);
      }
      if (ch.sTr) {
        ref1 = ch.sTr.querySelectorAll("th, td");
        results = [];
        for (o = 0, len1 = ref1.length; o < len1; o++) {
          cell = ref1[o];
          results.push(replaceClass(cell, classRowHide, classRowShow));
        }
        return results;
      }
    };
    expandShowRowSubtotal = function (h, opts) {
      var cell, l, len, len1, o, ref, ref1, results;
      h.th.innerHTML = ` ${arrowExpanded} ${h.text}`;
      ref = h.tr.querySelectorAll("th, td");
      for (l = 0, len = ref.length; l < len; l++) {
        cell = ref[l];
        removeClass(cell, `${classRowCollapsed} ${classRowHide}`);
        addClass(cell, `${classRowExpanded} ${classRowShow}`);
      }
      if (h.sTr) {
        ref1 = h.sTr.querySelectorAll("th, td");
        results = [];
        for (o = 0, len1 = ref1.length; o < len1; o++) {
          cell = ref1[o];
          removeClass(cell, `${classRowCollapsed} ${classRowHide}`);
          results.push(addClass(cell, `${classRowExpanded} ${classRowShow}`));
        }
        return results;
      }
    };
    expandHideRowSubtotal = function (h, opts) {
      var cell, l, len, len1, o, ref, ref1, results;
      h.th.innerHTML = ` ${arrowExpanded} ${h.text}`;
      ref = h.tr.querySelectorAll("th, td");
      for (l = 0, len = ref.length; l < len; l++) {
        cell = ref[l];
        removeClass(cell, `${classRowCollapsed} ${classRowShow}`);
        addClass(cell, `${classRowExpanded} ${classRowHide}`);
      }
      removeClass(h.th, `${classRowCollapsed} ${classRowHide}`);
      addClass(cell, `${classRowExpanded} ${classRowShow}`);
      if (h.sTr) {
        ref1 = h.sTr.querySelectorAll("th, td");
        results = [];
        for (o = 0, len1 = ref1.length; o < len1; o++) {
          cell = ref1[o];
          removeClass(cell, `${classRowCollapsed} ${classRowShow}`);
          results.push(addClass(cell, `${classRowExpanded} ${classRowHide}`));
        }
        return results;
      }
    };
    expandChildRow = function (ch, opts) {
      var chKey, l, len, ref, results;
      if (
        childNumberToCollapse &&
        childNumberToCollapse === ch.parent.descendants
      ) {
        let cellsToclear = ch.parent.tr.getElementsByClassName(
          "pvtRowLabelFiller"
        );
        for (let cell of cellsToclear) {
          cell.innerHTML = "";
        }
      }
      if (
        ch.children.length !== 0 &&
        opts.hideOnExpand &&
        ch.clickStatus === clickStatusExpanded
      ) {
        replaceClass(ch.th, classRowHide, classRowShow);
      } else {
        showChildRow(ch, opts);
      }
      if (
        ch.sTh &&
        ch.clickStatus === clickStatusExpanded &&
        opts.hideOnExpand
      ) {
        replaceClass(ch.sTh, classRowShow, classRowHide);
      }
      if (
        ch.clickStatus === clickStatusExpanded ||
        ch.col >= opts.disableFrom
      ) {
        ref = ch.children;
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          chKey = ref[l];
          results.push(expandChildRow(ch[chKey], opts));
        }
        return results;
      }
    };
    expandRow = function (axisHeaders, h, opts) {
      var ch, chKey, l, len, ref;
      if (h.clickStatus === clickStatusExpanded) {
        adjustAxisHeader(axisHeaders, h.col, opts);
        return;
      }
      ref = h.children;
      if (h.descendants > childNumberToCollapse) {
        for (l = 0, len = ref.length; l < len; l++) {
          chKey = ref[l];
          ch = h[chKey];
          expandChildRow(ch, opts);
        }
        if (opts.hideOnExpand && h.col > showSubtotalFromIndex) {
          expandHideRowSubtotal(h, opts);
        } else {
          expandShowRowSubtotal(h, opts);
        }
      }
      if (ref.length !== 0) {
        h.clickStatus = clickStatusExpanded;
        h.onClick = collapseRow;
      }
      axisHeaders.ah[h.col].expandedCount++;
      return adjustAxisHeader(axisHeaders, h.col, opts);
    };
    collapseAxis = function (axisHeaders, col, attrs, opts) {
      var collapsible, h, i, l, ref, ref1, results;
      collapsible = Math.min(attrs.length - 2, opts.disableFrom - 1);
      if (col > collapsible) {
        return;
      }
      results = [];
      for (i = l = ref = collapsible, ref1 = col; l >= ref1; i = l += -1) {
        results.push(
          (function () {
            var len, o, ref2, results1;
            ref2 = axisHeaders.ah[i].attrHeaders;
            results1 = [];
            for (o = 0, len = ref2.length; o < len; o++) {
              h = ref2[o];
              if (
                h.clickStatus === clickStatusExpanded &&
                h.children.length !== 0
              ) {
                results1.push(
                  axisHeaders.collapseAttrHeader(axisHeaders, h, opts)
                );
              }
            }
            return results1;
          })()
        );
      }
      return results;
    };
    collapseChildRows = function (axisHeaders, col, attrs, opts) {
      var collapsible, h, i, l, ref, ref1, results;
      collapsible = Math.min(attrs.length - 2, opts.disableFrom - 1);
      results = [];
      for (i = l = ref = collapsible, ref1 = col; l >= ref1; i = l += -1) {
        results.push(
          (function () {
            var len, o, ref2, results1;
            ref2 = axisHeaders.ah[i].attrHeaders;
            results1 = [];
            for (o = 0, len = ref2.length; o < len; o++) {
              h = ref2[o];
              if (
                h.clickStatus === clickStatusExpanded &&
                h.descendants === childNumberToCollapse
              ) {
                results1.push(
                  axisHeaders.collapseAttrHeader(axisHeaders, h, opts)
                );
              }
            }
            return results1;
          })()
        );
      }
      return results;
    };
    expandAxis = function (axisHeaders, col, attrs, opts) {
      var ah, h, i, l, ref, results;
      ah = axisHeaders.ah[col];
      results = [];
      for (
        i = l = 0, ref = col;
        0 <= ref ? l <= ref : l >= ref;
        i = 0 <= ref ? ++l : --l
      ) {
        results.push(
          (function () {
            var len, o, ref1, results1;
            ref1 = axisHeaders.ah[i].attrHeaders;
            results1 = [];
            for (o = 0, len = ref1.length; o < len; o++) {
              h = ref1[o];
              results1.push(axisHeaders.expandAttrHeader(axisHeaders, h, opts));
            }
            return results1;
          })()
        );
      }
      return results;
    };
    // when h.clickStatus is clickStatusCollapsed and h.children.length isnt 0 for i in [0..col]
    main = function (rowAttrs, rowKeys, colAttrs, colKeys) {
      var ah,
        chKey,
        colAttrHeaders,
        colAxisHeaders,
        colKeyHeaders,
        index,
        l,
        len,
        len1,
        len2,
        node,
        o,
        q,
        ref,
        ref1,
        ref2,
        result,
        rowAttrHeaders,
        rowAxisHeaders,
        rowKeyHeaders,
        tableClasses,
        tbody,
        thead,
        tr;
      rowAttrHeaders = [];
      colAttrHeaders = [];
      if (colAttrs.length !== 0 && colKeys.length !== 0) {
        colKeyHeaders = processKeys(colKeys, "pvtColLabel");
      }
      if (rowAttrs.length !== 0 && rowKeys.length !== 0) {
        rowKeyHeaders = processKeys(rowKeys, "pvtRowLabel");
      }
      if (colKeyHeaders && !useLookerRowTotals) {
        delete colKeyHeaders[LOOKER_ROW_TOTAL_KEY];
        colKeyHeaders.children = colKeyHeaders.children.filter(function (k) {
          return k !== LOOKER_ROW_TOTAL_KEY;
        });
      }
      tableClasses = "pvtTable";
      if (hasRowTotals) {
        tableClasses += " pvtHasRowTotals";
      }
      if (hasColTotals) {
        tableClasses += " pvtHasColTotals";
      }
      result = createElement("table", tableClasses, null, {
        style: "display: none;",
      });
      thead = createElement("thead");
      result.appendChild(thead);
      if (colAttrs.length !== 0) {
        colAxisHeaders = buildColAxisHeaders(thead, rowAttrs, colAttrs, opts);
        node = {
          counter: 0,
        };
        ref = colKeyHeaders.children;
        for (l = 0, len = ref.length; l < len; l++) {
          chKey = ref[l];
          buildColHeader(
            colAxisHeaders,
            colAttrHeaders,
            colKeyHeaders[chKey],
            rowAttrs,
            colAttrs,
            node,
            opts
          );
        }
        if (hasRowTotals && !useLookerRowTotals) {
          ref1 = colAxisHeaders.ah;
          for (index = o = 0, len1 = ref1.length; o < len1; index = ++o) {
            ah = ref1[index];
            if (index === colAxisHeaders.ah.length - 1) {
              buildRowTotalsHeader(ah.tr, null, rowAttrs, colAttrs);
            } else {
              ah.tr.appendChild(
                createElement("th", "pvtColTotalFiller", null, {
                  colspan: colAttrs.length,
                })
              );
            }
          }
        }
      }
      tbody = createElement("tbody");
      result.appendChild(tbody);
      if (rowAttrs.length !== 0) {
        rowAxisHeaders = buildRowAxisHeaders(thead, rowAttrs, colAttrs, opts);
        buildRowTotalsHeader(
          rowAxisHeaders.tr,
          colKeyHeaders,
          rowAttrs,
          colAttrs
        );
        node = {
          counter: 0,
        };
        ref2 = rowKeyHeaders.children;
        for (q = 0, len2 = ref2.length; q < len2; q++) {
          chKey = ref2[q];
          buildRowHeader(
            tbody,
            rowAxisHeaders,
            rowAttrHeaders,
            rowKeyHeaders[chKey],
            rowAttrs,
            colAttrs,
            node,
            opts
          );
        }
      }
      buildValues(
        tbody,
        colAttrHeaders,
        rowAttrHeaders,
        rowAttrs,
        colAttrs,
        opts
      );
      if (hasColTotals) {
        tr = buildColTotalsHeader(rowAttrs, colAttrs);
        if (colAttrs.length > 0) {
          buildColTotals(tr, colAttrHeaders, rowAttrs, colAttrs, opts);
        }
        if (hasRowTotals && !useLookerRowTotals) {
          buildGrandTotal(tbody, tr, rowAttrs, colAttrs, opts);
        }
        tbody.appendChild(tr);
      }
      collapseAxis(
        colAxisHeaders,
        opts.colSubtotalDisplay.collapseAt,
        colAttrs,
        opts.colSubtotalDisplay
      );
      collapseAxis(
        rowAxisHeaders,
        opts.rowSubtotalDisplay.collapseAt,
        rowAttrs,
        opts.rowSubtotalDisplay
      );
      collapseChildRows(rowAxisHeaders, 0, rowAttrs, opts.rowSubtotalDisplay);
      result.setAttribute("data-numrows", rowKeys.length);
      result.setAttribute("data-numcols", colKeys.length);
      result.style.display = "";
      return result;
    };
    return main(rowAttrs, rowKeys, colAttrs, colKeys);
  };
  $.pivotUtilities.subtotal_renderers = {
    "Table With Subtotal": function (pvtData, opts) {
      return SubtotalRenderer(pvtData, opts);
    },
    "Table With Subtotal Bar Chart": function (pvtData, opts) {
      return $(SubtotalRenderer(pvtData, opts)).barchart();
    },
    "Table With Subtotal Heatmap": function (pvtData, opts) {
      return $(SubtotalRenderer(pvtData, opts)).heatmap("heatmap", opts);
    },
    "Table With Subtotal Row Heatmap": function (pvtData, opts) {
      return $(SubtotalRenderer(pvtData, opts)).heatmap("rowheatmap", opts);
    },
    "Table With Subtotal Col Heatmap": function (pvtData, opts) {
      return $(SubtotalRenderer(pvtData, opts)).heatmap("colheatmap", opts);
    },
  };

  // Aggregators

  usFmtPct = $.pivotUtilities.numberFormat({
    digitsAfterDecimal: 1,
    scaler: 100,
    suffix: "%",
  });
  aggregatorTemplates = $.pivotUtilities.aggregatorTemplates;
  subtotalAggregatorTemplates = {
    fractionOf: function (wrapped, type = "row", formatter = usFmtPct) {
      return function (...x) {
        return function (data, rowKey, colKey) {
          if (typeof rowKey === "undefined") {
            rowKey = [];
          }
          if (typeof colKey === "undefined") {
            colKey = [];
          }
          return {
            selector: {
              row: [rowKey.slice(0, -1), []],
              col: [[], colKey.slice(0, -1)],
            }[type],
            inner: wrapped(...x)(data, rowKey, colKey),
            push: function (record) {
              return this.inner.push(record);
            },
            format: formatter,
            value: function () {
              return (
                this.inner.value() /
                data.getAggregator(...this.selector).inner.value()
              );
            },
            numInputs: wrapped(...x)().numInputs,
          };
        };
      };
    },
  };
  $.pivotUtilities.subtotalAggregatorTemplates = subtotalAggregatorTemplates;
  return ($.pivotUtilities.subtotal_aggregators = (function (tpl, sTpl) {
    return {
      "Sum As Fraction Of Parent Row": sTpl.fractionOf(
        tpl.sum(),
        "row",
        usFmtPct
      ),
      "Sum As Fraction Of Parent Column": sTpl.fractionOf(
        tpl.sum(),
        "col",
        usFmtPct
      ),
      "Count As Fraction Of Parent Row": sTpl.fractionOf(
        tpl.count(),
        "row",
        usFmtPct
      ),
      "Count As Fraction Of Parent Column": sTpl.fractionOf(
        tpl.count(),
        "col",
        usFmtPct
      ),
    };
  })(aggregatorTemplates, subtotalAggregatorTemplates));
});
