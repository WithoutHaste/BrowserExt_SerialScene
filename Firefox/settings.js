

console.log("test settings from separate file");
const bookmarkRoot = document.getElementById("bookmark_root");
bookmarkRoot.innerHTML = "div div";

const bookmarkTreePromise = browser.bookmarks.getTree();
bookmarkTreePromise.then(displayBookmarkTree, onRejected);

function displayBookmarkItem(item, root) {
	if(item.url) {
		displayBookmarkUrl(item, root);
	}
	else {
		displayBookmarkFolder(item, root);
	}

	function displayBookmarkUrl(item, root) {
		if(item.unmodifiable) {
			return;
		}
		if(item.url.startsWith("place")) {
			return;
		}
		
		let div = document.createElement('div');
		div.innerHTML = item.title;
		root.appendChild(div);
	}
	
	function displayBookmarkFolder(folder, root) {
		let div = document.createElement('div');
		div.classList.add("folder");
		
		let label = document.createElement('div');
		label.classList.add("folder_label");
		label.innerHTML = (folder.title ?? "Folder") + " +/-";
		div.appendChild(label);
		
		let contents = document.createElement('div');
		contents.classList.add("folder_contents");
		div.appendChild(contents);
/*		
		label.onclick = function() {
			if(contents.style.display == "none") {
				contents.style.display = "block";
			}
			else {
				contents.style.display = "none";
			}
		});
	*/	
		root.appendChild(div);

		displayBookmarkTree(folder.children, contents);
	}
}

function displayBookmarkTree(items, root) {
	if(root == null) {
		root = bookmarkRoot;
	}
	for(let i=0; i<items.length; i++)
	{
		displayBookmarkItem(items[i], root);
	}
}

function onRejected(error) {
	console.log(`Error: ${error}`);
}

