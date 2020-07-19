
const bookmarkRoot = document.getElementById("bookmark_root");

const bookmarkTreePromise = browser.bookmarks.getTree();
bookmarkTreePromise.then(displayBookmarkTree, onRejected);

function displayBookmarkItem(item, root, level) {
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
		if(item.url.startsWith("place")) {
			return;
		}
		
		let div = document.createElement('div');
		div.innerHTML = item.title;
		root.appendChild(div);
	}
	
	function displayBookmarkFolder(folder, root, level) {
		let div = document.createElement('div');
		div.classList.add("folder");
		
		let label = document.createElement('div');
		label.classList.add("folder_label");
		label.innerHTML = (folder.title ?? "Folder") + " +/-";
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

		displayBookmarkTree(folder.children, contents, level + 1);
	}
}

function displayBookmarkTree(items, root, level) {
	if(root == null) {
		root = bookmarkRoot;
		level = 1;
	}
	for(let i=0; i<items.length; i++)
	{
		displayBookmarkItem(items[i], root, level);
	}
}

function onRejected(error) {
	console.log(`Error: ${error}`);
}

