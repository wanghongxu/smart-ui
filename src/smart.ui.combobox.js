(function ($, undefined) {

    $.widget("smart-ui.combobox", {
        verson:"0.1",
        options:{
            items:[],
            textField:"",
            valueField:"",
            width:"150px",
            isEditable:false,
            isMultiSelect:false,
            textFormatter:function (item) {
                return item[this.textField];
            },
            disabled:false,

            // callbacks
            onSelect:null
        },

        _create:function () {
            var self = this;
            //存储了所有item的hash列表对象
            this._items = {};
            $.each(this.options.items, function () {
                var item = this;
                self[item[self.options.valueField]] = item[self.options.textField];
            });
            this._selectedItems = {};

            this._createContainerOfWidget();
            this._createInputAndDropDownButton();
            this._createItemList();
        },

        _createContainerOfWidget:function () {
            var self = this;
            var containerOfInputAndDropDownButton =
                "<div class='combobox-text-wrap'>" +
                    "<table style='width: 100%;' cellspacing='0' cellpadding='0'>" +
                    "<tr><td style='width:100%;'></td><td style='width:22px;'></td></tr>" +
                    "</table></div>";

            this.element.addClass("combobox-container")
                .css({width:this.options.width})
                .append(containerOfInputAndDropDownButton)

            var itemListHeight = this._calculateItemListHeight();

            var posContainer = this.element.offset();

            var itemListShowPosition = {left:null, right:null};
            if ( $(window).height() - posContainer.top - 22 > itemListHeight ){
                itemListShowPosition.left = posContainer.left + "px";
                itemListShowPosition.top = (posContainer.top + 22) + "px";
            }else{
                itemListShowPosition.left = posContainer.left + "px";
                itemListShowPosition.top = (posContainer.top - itemListHeight + 1) + "px";
            }

            this.containerOfItemList = $("<div>")
                .addClass("combobox-itemlist-wrap")
                .css({
                    //下拉列表与控件同宽
                    left:itemListShowPosition.left,
                    top:itemListShowPosition.top,
                    width:self.options.width,
                    height:itemListHeight
                });
            this.itemList = $("<ul>")
                .addClass("combobox-itemlist")
                .appendTo(this.containerOfItemList);
            this.element.append(this.containerOfItemList);
        },

        _createInputAndDropDownButton:function () {
            var self = this;
            var textAndTriggerWrap = this.element.find(".combobox-text-wrap td");

            //初始化输入框
            this.comboboxText = $("<input type='text'>")
                .addClass("combobox-text");
            if ( !self.options.isEditable ) {
                this.comboboxText.attr("readonly", "readonly")
                    .addClass("combobox-text-readonly")
                    .focus(function () {
                        $(this).blur();
                    });
            }
            this.comboboxText.appendTo(textAndTriggerWrap.eq(0));

            textAndTriggerWrap.click(function () {
                if ( self.options.disabled )
                    return;

                if ( self.containerOfItemList.is(":hidden") ) {
                    self.containerOfItemList.show();
                } else {
                    self.containerOfItemList.hide();
                }
            });

            //初始化下拉按钮(倒三角)
            this.comboboxTrigger = $("<div>").addClass("combobox-trigger")
                .appendTo(textAndTriggerWrap.eq(1));

            this.document.bind("mousedown", function (event) {
                if ( event.target === self.comboboxText.get(0) ||
                        event.target === self.comboboxTrigger.get(0) )
                    return;

                if (!$(event.target).closest(self.containerOfItemList).length) {
                    self.containerOfItemList.hide();
                }
            });
        },

        _createItemList:function () {
            var self = this,
                dataArray = self.options.items;

            if ( dataArray != null && dataArray.length > 0 ) {
                this.addItems(dataArray);

                $(this.itemList).click(function (e) {
                    if (e.target && e.target.tagName == 'LI') {
                        if ( self.options.disabled )
                            return;

                        var item = $(e.target);
                        var originalValue = item.attr("value");
                        var originalText = item.html();
                        if ( self.options.isMultiSelect && item.is(".item-selected") ) {
                            item.removeClass("item-selected");
                            self._removeFromCombobox(originalText);
                            self._removeFromSelectedItems({value:originalValue, text:originalText});
                        } else if ( self.options.isMultiSelect && !item.is(".item-selected") ) {
                            item.addClass("item-selected");
                            self._addToCombobox(originalText);
                            self._addToSelectedItems({value:originalValue, text:originalText});
                        } else {
                            $(self.itemList).find(".item-selected").removeClass("item-selected");
                            item.addClass("item-selected");
                            self.comboboxText.val(originalText);
                            self._addToSelectedItems({value:originalValue, text:originalText});
                            self.containerOfItemList.hide();
                        }

                        self._trigger("onSelect", e, {"item":item});
                    }
                })
                    .mouseover(function (e) {
                        if ( e.target && e.target.tagName === 'LI' ) {
                            $(e.target).addClass("item-over")
                        }
                    })
                    .mouseout(function (e) {
                        if ( e.target && e.target.tagName === 'LI' ) {
                            $(e.target).removeClass("item-over")
                        }
                    });

                this.containerOfItemList.css({height:this._calculateItemListHeight()});
            }
        },

        _addToCombobox:function (newText) {
            if ( this.comboboxText.val() != null && this.comboboxText.val().length > 0 ) {
                this.comboboxText.val(this.comboboxText.val() + ", " + newText);
            } else {
                this.comboboxText.val(newText);
            }
        },

        _removeFromCombobox:function (originalText) {
            var spliterBefore = ", " + originalText;
            var spliterAfter = originalText + ", ";

            this.comboboxText.val(this.comboboxText.val().replace(
                eval("/" + spliterAfter + "|" + spliterBefore + "|" + originalText + "/"), ""));
        },

        _addToSelectedItems:function (item) {
            this._selectedItems[item.value] = item.text;
        },

        _removeFromSelectedItems:function (item) {
            delete this._selectedItems[item.value];
        },

        _calculateItemListHeight:function () {
            return this.options.items.length * 22 >= 180 ? 180 : this.options.items.length * 22 + 2;
        },

        selectedItems:function () {
            return this._selectedItems;
        },

        selectedValues:function () {
            var values = []
            if ( this._selectedItems != null ) {
                for (var val in this._selectedItems) {
                    values.push(val);
                }
            }
            return values;
        },

        selectedValue:function () {
            var values = this.selectedValues();
            if ( !this.options.isMultiSelect && values.length === 1 ) {
                return values[0];
            }
        },

        selectedItem:function () {
            if ( !self.options.isMultiSelect && this._selectedItems != null ) {
                for (var val in this._selectedItems) {
                    var item = {};
                    item[self.options.valueField] = val;
                    item[self.options.textField] = this._selectedItems[val];
                    return item;
                }
                return this._selectedItems[0];
            }
        },

        //选项设置操作
        select:function (values) {
            var self = this;
            this.itemList.find(".item-selected").removeClass("item-selected");
            this.comboboxText.val("");
            this._selectedItems = {};

            $.each(this.itemList.find("li"), function () {
                if ($.inArray(parseInt($(this).attr("value")), values) != -1) {
                    $(this).addClass("item-selected");

                    var item = {};
                    item[self.options.valueField] = parseInt($(this).attr("value"));
                    item[self.options.textField] = $(this).text();
                    self._addToCombobox(self.options.textFormatter(item));
                    self._addToSelectedItems({value:item[self.options.valueField],
                        text:self.options.textFormatter(item)});

                    self._trigger("onSelect", null, {item:$(this)});
                }
            });
        },

        unSelect:function (values) {
            var self = this;
            $.each(this.itemList.find("li.item-selected"), function () {
                if ( $.inArray(parseInt($(this).attr("value")), values) != -1 ) {
                    $(this).removeClass("item-selected");
                    self._removeFromSelectedItems({value:parseInt($(this).attr("value"))});
                    self._removeFromCombobox($(this).text());
                }
            });
        },

        clearSelected:function () {
            this._selectedItems = {};
            this.comboboxText.val("");
            this.itemList.find(".item-selected").removeClass("item-selected");
        },

        //选项的维护方法，重新设值，增加选项，移除选项，清空所有选项
        setItems:function (items) {
            this.options.items = items;
            this._selectedItems = [];
            this.itemList.empty();
            this.comboboxText.val("");
            this.addItems(items);
        },

        addItems:function (items) {

            var liListStr = "";
            for (var i = 0; i < items.length; i++) {
                var liStr = [ "<li value='", items[i][this.options.valueField] , "' " , ">" ,
                    this.options.textFormatter(items[i])  , "</li>" ].join("");
                liListStr += liStr;
            }
            $(liListStr).appendTo(this.itemList);

            this.containerOfItemList.css({height:this._calculateItemListHeight()});

        },

        removeItems:function (items) {

        },

        clearItems:function () {
            this.options.items = [];
            this._selectedItems = [];
            this.itemList.empty();
            this.comboboxText.val("");
            this.containerOfItemList.css({height:this._calculateItemListHeight()});
        }

    });

}(jQuery));
