# version=0.1.0

#Login ACR
echo "LOG:[`date -u +'%Y-%m-%dT%H:%M:%SZ'`] Login ACR"
docker login ${ACR_LOGINSERVER} -u ${ACR_ID} -p ${ACR_PASSWORD}

## Create Array of Service names
allServices=(aboutme auth careplan chat circle configuration controller \
coping database diary ePJS email goal job mcDNA medication message mood \
problem room schoolfeedback sleep survey user)

#Build new image and push to ACR.
echo "LOG:[`date -u +'%Y-%m-%dT%H:%M:%SZ'`] START DOCKER IMAGE BUILDS"

for i in ${allServices[@]};
do
    echo "LOG:[`date -u +'%Y-%m-%dT%H:%M:%SZ'`] START Docker image build for ${i}"
    SERVICE_IMG_CONTROLLER="${ACR_LOGINSERVER}/phr-${i}-controller:v${BUILD_NUMBER}"
    docker build \
    --build-arg BUILD_DATE=$(`date -u +'%Y-%m-%dT%H:%M:%SZ'`) \
    --build-arg PHR_VERSION="0.7.0" \
    --build-arg APP_RELEASE="stable" \
    --build-arg APP_ENV="production" \
    -t $SERVICE_IMG_CONTROLLER ./services/${i} && \
    docker push $SERVICE_IMG_CONTROLLER
    echo "LOG:[`date -u +'%Y-%m-%dT%H:%M:%SZ'`] END Docker image build for ${i}"
done

echo "LOG:[`date -u +'%Y-%m-%dT%H:%M:%SZ'`] DONE DOCKER IMAGE BUILDS"
