// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureDrive {
    struct File {
        string ipfsHash;
        string fileName;
        string fileType;
        uint256 fileSize;
        uint256 uploadTime;
        address uploader;
        string folderId;
    }
    
    struct Folder {
        string folderId;
        string folderName;
        uint256 createdTime;
        address creator;
    }
    
    mapping(string => File) public files;
    mapping(string => Folder) public folders;
    mapping(address => string[]) public userFiles;
    mapping(address => string[]) public userFolders;
    
    event FileUploaded(
        string indexed fileId,
        string ipfsHash,
        string fileName,
        address uploader,
        uint256 uploadTime
    );
    
    event FolderCreated(
        string indexed folderId,
        string folderName,
        address creator,
        uint256 createdTime
    );
    
    function uploadFile(
        string memory _fileId,
        string memory _ipfsHash,
        string memory _fileName,
        string memory _fileType,
        uint256 _fileSize,
        string memory _folderId
    ) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        
        files[_fileId] = File({
            ipfsHash: _ipfsHash,
            fileName: _fileName,
            fileType: _fileType,
            fileSize: _fileSize,
            uploadTime: block.timestamp,
            uploader: msg.sender,
            folderId: _folderId
        });
        
        userFiles[msg.sender].push(_fileId);
        
        emit FileUploaded(_fileId, _ipfsHash, _fileName, msg.sender, block.timestamp);
    }
    
    function createFolder(string memory _folderId, string memory _folderName) public {
        require(bytes(_folderName).length > 0, "Folder name cannot be empty");
        
        folders[_folderId] = Folder({
            folderId: _folderId,
            folderName: _folderName,
            createdTime: block.timestamp,
            creator: msg.sender
        });
        
        userFolders[msg.sender].push(_folderId);
        
        emit FolderCreated(_folderId, _folderName, msg.sender, block.timestamp);
    }
    
    function getUserFiles(address _user) public view returns (File[] memory) {
        string[] memory fileIds = userFiles[_user];
        File[] memory userFileList = new File[](fileIds.length);
        
        for (uint i = 0; i < fileIds.length; i++) {
            userFileList[i] = files[fileIds[i]];
        }
        
        return userFileList;
    }
    
    function getUserFolders(address _user) public view returns (Folder[] memory) {
        string[] memory folderIds = userFolders[_user];
        Folder[] memory userFolderList = new Folder[](folderIds.length);
        
        for (uint i = 0; i < folderIds.length; i++) {
            userFolderList[i] = folders[folderIds[i]];
        }
        
        return userFolderList;
    }
}