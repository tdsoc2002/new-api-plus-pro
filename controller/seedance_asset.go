package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
)

func ListSeedanceAssetGroups(c *gin.Context) {
	groups, err := service.ListSeedanceAssetGroups(c.GetInt("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, groups)
}

func CreateSeedanceAssetGroup(c *gin.Context) {
	var input service.CreateSeedanceAssetGroupInput
	if err := common.UnmarshalBodyReusable(c, &input); err != nil {
		common.ApiError(c, err)
		return
	}
	group, err := service.CreateSeedanceAssetGroup(c, c.GetInt("id"), input)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, group)
}

func GetSeedanceAssetStorage(c *gin.Context) {
	storage, err := service.GetUserAssetStorage(c.GetInt("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, storage)
}

func ListSeedanceAssets(c *gin.Context) {
	pageNum, _ := strconv.Atoi(c.DefaultQuery("page_num", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	items, total, err := service.ListSeedanceAssets(c.GetInt("id"), c.Query("group_id"), c.Query("status"), pageNum, pageSize)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{
		"items": items,
		"total": total,
	})
}

func UploadSeedanceAssetURL(c *gin.Context) {
	var input service.UploadSeedanceAssetURLInput
	if err := common.UnmarshalBodyReusable(c, &input); err != nil {
		common.ApiError(c, err)
		return
	}
	asset, err := service.UploadSeedanceAssetByURL(c, c.GetInt("id"), input)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, asset)
}

func UploadSeedanceAssetFile(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "file is required"})
		return
	}
	asset, err := service.UploadSeedanceAssetFile(c, c.GetInt("id"), c.PostForm("group_id"), c.PostForm("name"), fileHeader)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, asset)
}

func SyncSeedanceAsset(c *gin.Context) {
	asset, err := service.SyncSeedanceAsset(c, c.GetInt("id"), c.Param("official_id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, asset)
}

func DeleteSeedanceAsset(c *gin.Context) {
	if err := service.DeleteSeedanceAsset(c, c.GetInt("id"), c.Param("official_id")); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, model.SeedanceAsset{})
}
