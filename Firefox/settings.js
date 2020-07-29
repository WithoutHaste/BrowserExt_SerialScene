
const bookmarkRoot = document.getElementById("bookmark_root");
let startingSelectedBookmarks = [];

Promise.all([
	browser.storage.local.get("selected"),
	browser.bookmarks.getTree()
]).then(function(results) {
	startingSelectedBookmarks = results[0].selected ?? [];
	let bookmarks = results[1];
	displayBookmarkTree(bookmarks);
}, function() {
	let span = document.createElement('span');
	span.innerHTML = "⚠️ An error has occurred";
	bookmarkRoot.appendChild(span);
});

function displayBookmarkItem(item, root, level, pathArray) {
	if(item.url) {
		displayBookmarkUrl(item, root);
	}
	else {
		displayBookmarkFolder(item, root, level);
	}

	function displayBookmarkUrl(item, root) {
		if(item.unmodifiable) {
			return;
		}
		if(!item.url.startsWith("http")) {
			return;
		}
		
		let urlRemainder = stripFilename(item.url);
		
		let div = document.createElement('div');

		let checkbox = document.createElement('input');
		checkbox.setAttribute("type", "checkbox");
		checkbox.style.display = "inline";
		checkbox.classList.add("url_checkbox");
		checkbox.dataset.url = urlRemainder;
		checkbox.checked = checkboxIsSelected(pathArray.slice(), urlRemainder);
		checkbox.addEventListener("change", saveSettings);
		div.appendChild(checkbox);
		
		let label = document.createElement('span');
		if(item.title == null || item.title.length == 0) {
			label.innerHTML = item.url;
		}
		else {
			label.innerHTML = item.title;
		}
		div.appendChild(label);

		root.appendChild(div);
	}
	
	function displayBookmarkFolder(folder, root, level) {
		if(folder.children.length == 0) {
			return;
		}
		
		let div = document.createElement('div');
		div.classList.add("folder");
		
		let checkbox = document.createElement('input');
		checkbox.setAttribute("type", "checkbox");
		checkbox.style.display = "inline";
		checkbox.classList.add("folder_checkbox");
		checkbox.dataset.folderName = folder.title;
		checkbox.checked = checkboxIsSelected(pathArray.slice(), folder.title);
		checkbox.addEventListener("change", saveSettings);
		div.appendChild(checkbox);
		
		let label = document.createElement('div');
		label.style.display = "inline";
		label.classList.add("folder_label");
		label.dataset.folderLabel = (level==1?"All":folder.title);
		label.innerHTML = "📁 " + label.dataset.folderLabel;
		div.appendChild(label);
		
		let contents = document.createElement('div');
		contents.classList.add("folder_contents");
		if(level > 1) {
			contents.style.display = "none";
		}
		div.appendChild(contents);

		label.onclick = function(event) {
			let label = event.target;
			let contents = label.nextSibling;
			if(contents.style.display == "none") {
				contents.style.display = "block";
			}
			else {
				contents.style.display = "none";
			}
		};

		root.appendChild(div);

		let newPathArray = pathArray.slice();
		newPathArray.push(folder.title);
		displayBookmarkTree(folder.children, contents, level + 1, newPathArray);
	}
}

function displayBookmarkTree(items, root, level, pathArray) {
	if(root == null) {
		root = bookmarkRoot;
		level = 1;
		pathArray = [];
	}
	for(let i=0; i<items.length; i++)
	{
		displayBookmarkItem(items[i], root, level, pathArray);
	}
}

function onRejected(error) {
	console.log(`Error: ${error}`);
}

function saveSettings() {
	let selected = getFolderTreeSelections(bookmarkRoot, [], []);
	
	browser.storage.local.set({
		selected: selected
	});
	
	browser.storage.local.get().then((results) => console.log(results));
}

//flattens tree structure into array of routes
//result looks like
//["All", "Other Bookmarks", "Comics", "*"]
function getFolderSelections(folderElement, folderRouteArray, selectedArray) {
	if(folderElement == null) {
		return selectedArray;
	}
	let folderName = null;
	let folderChecked = false;
	let folderContents = null;
	for(let i=0; i<folderElement.children.length; i++)
	{
		let child = folderElement.children[i];
		if(child.classList.contains("folder_checkbox")) {
			folderName = child.dataset.folderName;
			folderChecked = child.checked;
		}
		if(child.classList.contains("folder_contents")) {
			folderContents = child;
		}
	}
	if(folderChecked) {
		let newRoute = folderRouteArray.slice();
		newRoute.push(folderName);
		selectedArray.push(newRoute);
	}
	else {
		let newRouteArray = folderRouteArray.slice();
		newRouteArray.push(folderName);
		selectedArray = getFolderTreeSelections(folderContents, newRouteArray, selectedArray);
	}
	return selectedArray;
}
function getFolderTreeSelections(contentsElement, folderRouteArray, selectedArray) {
	if(contentsElement == null) {
		return selectedArray;
	}
	for(let i=0; i<contentsElement.children.length; i++)
	{
		let child = contentsElement.children[i];
		if(child.classList.contains("folder")) {
			selectedArray = getFolderSelections(child, folderRouteArray, selectedArray);
		}
		else if(child.tagName.toLowerCase() == "div") {
			//urls are contained in a div
			selectedArray = getFolderTreeSelections(child, folderRouteArray, selectedArray);
		}
		else if(child.classList.contains("url_checkbox") && child.checked) {
			let newRoute = folderRouteArray.slice();
			newRoute.push(child.dataset.url);
			selectedArray.push(newRoute);
		}
	}
	return selectedArray;
}

function checkboxIsSelected(pathArray, lastElement) {
	pathArray.push(lastElement);
	for(let i=0; i<startingSelectedBookmarks.length; i++)
	{
		if(arraysMatch(pathArray, startingSelectedBookmarks[i])) {
			return true;
		}
	}
	return false;	
}
function arraysMatch(a, b) {
	if(a.length != b.length) {
		return false;
	}
	for(let i=0; i<a.length; i++)
	{
		if(a[i] != b[i]) {
			return false;
		}
	}
	return true;
}

//return url without ending filename
function stripFilename(url) {
	if(url.endsWith("/")) {
		return url;
	}
	let filename = url.substring(url.lastIndexOf('/')+1);
	if(filename.indexOf(".") == -1) {
		return url;
	}
	let remainder = url.substring(0, url.length - filename.length);
	if(remainder == "https://" || remainder == "http://") {
		return url;
	}
	return remainder;
}
