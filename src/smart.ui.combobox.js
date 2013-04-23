(function( $, undefined ){

$.widget("smart-ui.combobox", {
	verson: "0.1",
	options: {
		datas: [],
		textField: "",
		valueField: "",
		width: "150px",
		isEditable: false,
		isMultiSelect: false,
		defaultSelecItem: {value: 0, text: ""},
		textFormatter: function(item){
			return item[this.textField];
		},
		disabled: false,
		
		// callbacks
		select: null
	},
	
	_create: function(){
		var self = this;
		var domComboboxTextAndTrigger = "<div class='combobox-text-wrap'><table style='width: 100%;' cellspacing='0' cellpadding='0'><tr><td style='width:100%;'></td><td style='width:22px;'></td></tr></table></div>";

		var itemListHeight = this.options.datas.length*22 >= 180 ? 180 : this.options.datas.length*22 + 2;
		this.itemListWrap = $("<div>")
			.addClass("combobox-itemlist-wrap")
			.css({
				//下拉列表与控件同宽
				width:self.options.width,
				height:itemListHeight
			});
		this.itemList = $("<ul>")
			.addClass("combobox-itemlist")
			.appendTo(this.itemListWrap);

		this._createItemList();

		this.element.addClass("combobox-container")
			.css({width:this.options.width})
			.append(domComboboxTextAndTrigger)
			.append(this.itemListWrap);

		var textAndTriggerWrap = this.element.find(".combobox-text-wrap td");
		
		//初始化输入框		
		this.comboboxText = $("<input type='text'>")
			.addClass("combobox-text");
		if(!self.options.isEditable){
			this.comboboxText.attr("readonly", "readonly")
			.addClass("combobox-text-readonly")
			.focus(function(){
				$(this).blur();
			});
		}
		this.comboboxText.appendTo(textAndTriggerWrap.eq(0));
		
		textAndTriggerWrap.click(function(){
			if(self.itemListWrap.is(":hidden")){
				self.itemListWrap.show();
			}else{
				self.itemListWrap.hide();
			}
		});
		
		//初始化下拉按钮(倒三角)
		this.comboboxTrigger = $("<div>")
			.addClass("combobox-trigger")
			.appendTo(textAndTriggerWrap.eq(1));

		this.document.bind("mousedown", function( event ){
			if( event.target !== self.comboboxText &&
				event.target !== self.comboboxTrigger &&
				!$(event.target).closest(self.itemListWrap).length ){
				self.itemListWrap.hide();
			}
		});
		
		this._selectedItems = [];
	},
	
	/**
	  *构造数据内容
	  */
	_createItemList : function(){
		var self = this;
		var dataArray = self.options.datas;
		if(dataArray != null && dataArray.length > 0){
			for(var i=0; i<dataArray.length; i++){
				var domItem = "<li value='" + dataArray[i][self.options.valueField] + "'>" + this.options.textFormatter(dataArray[i])  + "</li>";
				self.itemList.append(domItem);
			}
			$(self.itemList).find("li")
			.click(function(event){
				var item = $(this);
				var originalValue = $(this).attr("value");
				var originalText = $(this).html();
				if(self.options.isMultiSelect && $(this).is(".item-selected")){
				
					$(this).removeClass("item-selected");
					
					var spliterBefore = ", " + originalText;
					var spliterAfter = originalText + ", " ;
					
					self.comboboxText.val( self.comboboxText.val().replace(eval("/"+spliterAfter+"|"+spliterBefore+"|"+originalText+"/"),"") )
					self._removeItem({value:originalValue, text:originalText});					
				}else if(self.options.isMultiSelect && !$(this).is(".item-selected")){
					$(this).addClass("item-selected");
					if(self.comboboxText.val() != null && self.comboboxText.val().length > 0){
						self.comboboxText.val(self.comboboxText.val() + ", " + originalText);
					}else{
						self.comboboxText.val(originalText);
					}
					self._addItem({value:originalValue, text:originalText});
				}else{
					$(self.itemList).find(".item-selected").removeClass("item-selected");
					$(this).addClass("item-selected");
					self.comboboxText.val(originalText);
					self._addItem({value:originalValue, text:originalText});
					self.itemListWrap.hide();
				}
				
				self._trigger( "select", event, {item: item});

			})
			.mouseover(function(){
				$(this).addClass("item-over")
			})
			.mouseout(function(){
				$(this).removeClass("item-over")
			})
		}
	},
	
	_addItem : function(item){
		if(!this.options.isMultiSelect){
			this._selectedItems = [];
		}
		this._selectedItems.push(item);
	},
	
	_removeItem : function(item){
		if(this.options.isMultiSelect){
			var self = this;
			$.each(this._selectedItems, function(i, ele){
				if(ele.value == item.value){
					self._selectedItems.splice(i,1);
					return false;
				}
			})
		}else{
			this._selectedItems = [];
		}
	},
	
	selectedItems : function(){
		return this._selectedItems;
	},
	
	selectedValues : function(){
		var values = []
		if(this._selectedItems.length > 0){
			for(var i=0; i<this._selectedItems.length; i++){
				var item = this._selectedItems[i];
				values.push(item.value);
			}
		}
		return values;
	},
	
	selectedValue : function(){
		if(!self.options.isMultiSelect && this._selectedItems.length == 1){
			return this._selectedItems[0].value;
		}
	},
	
	selectedItem : function(){
		if(!self.options.isMultiSelect && this._selectedItems.length == 1){
			return this._selectedItems[0];
		}
	}

});

}( jQuery ));
